import type { DrizzleClient } from "#app/database/drizzle-client.ts";
import {
  appointments,
  clients,
  therapists,
  treatments,
  users,
} from "#app/database/schemas.ts";
import type {
  AppointmentStatus,
  CancellationReason,
  Speciality,
  TreatmentCategory,
} from "#app/database/types.ts";
import { BadRequestError, ConflictError, NotFoundError } from "#app/errors/httpErrors.ts";
import type { Pagination } from "#app/modules/general/dto/index.ts";
import { and, asc, count, desc, eq, gt, gte, inArray, lt, lte, not } from "drizzle-orm";
import type {
  CreateAppointmentBody,
  UpdateAppointmentStatusBody,
  UpdateAppointmentBody,
} from "./appointments.admin.dto.ts";
import type {
  AppointmentSortBy,
  AppointmentSortParams,
} from "./appointments.shared.dto.ts";

type AppointmentFilters = {
  id?: number;
  therapistId?: number;
  clientId?: number;
  status?: AppointmentStatus;
  dateFrom?: string;
  dateTo?: string;
};

type AppointmentQueryRow = typeof appointments.$inferSelect & {
  clientFirstName: string;
  clientLastName: string;
  clientBirthDate: string | null;
  clientPhone: string | null;
  clientEmail: string | null;
  clientPreferredCommunication: (typeof clients.$inferSelect)["preferredCommunication"];
  therapistSpeciality: Speciality | null;
  therapistPhone: string | null;
  therapistIsActive: boolean | null;
  therapistFirstName: string | null;
  therapistLastName: string | null;
  therapistEmail: string | null;
  treatmentCategory: TreatmentCategory | null;
  treatmentPricePerUnit: string | null;
  treatmentQuantity: number | null;
  treatmentTotalAmount: string | null;
  treatmentDurationMinutes: number | null;
  treatmentIsActive: boolean | null;
};

const VALID_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  requested: ["scheduled", "cancelled"],
  scheduled: ["confirmed", "cancelled"],
  confirmed: ["completed", "no_show", "cancelled"],
  completed: [],
  no_show: [],
  cancelled: [],
};

const APPOINTMENT_SORT_COLUMNS = {
  startedAt: appointments.startedAt,
  createdAt: appointments.createdAt,
} satisfies Record<AppointmentSortBy, unknown>;

const appointmentSelect = {
  id: appointments.id,
  therapistId: appointments.therapistId,
  clientId: appointments.clientId,
  treatmentId: appointments.treatmentId,
  startedAt: appointments.startedAt,
  endedAt: appointments.endedAt,
  notes: appointments.notes,
  status: appointments.status,
  cancellationReason: appointments.cancellationReason,
  cancellationNote: appointments.cancellationNote,
  createdAt: appointments.createdAt,
  updatedAt: appointments.updatedAt,
  clientFirstName: clients.firstName,
  clientLastName: clients.lastName,
  clientBirthDate: clients.birthDate,
  clientPhone: clients.phone,
  clientEmail: clients.email,
  clientPreferredCommunication: clients.preferredCommunication,
  therapistSpeciality: therapists.speciality,
  therapistPhone: therapists.phone,
  therapistIsActive: therapists.isActive,
  therapistFirstName: users.firstName,
  therapistLastName: users.lastName,
  therapistEmail: users.email,
  treatmentCategory: treatments.category,
  treatmentPricePerUnit: treatments.pricePerUnit,
  treatmentQuantity: treatments.quantity,
  treatmentTotalAmount: treatments.totalAmount,
  treatmentDurationMinutes: treatments.durationMinutes,
  treatmentIsActive: treatments.isActive,
};

export class AppointmentsService {
  private db: DrizzleClient;

  constructor(db: DrizzleClient) {
    this.db = db;
  }

  async all(
    filters: AppointmentFilters = {},
    pagination: Pagination = {},
    sort: AppointmentSortParams = {},
  ) {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;
    const col = APPOINTMENT_SORT_COLUMNS[sort.sortBy ?? "startedAt"];
    const orderExpr =
      (sort.sortOrder ?? "desc") === "asc" ? asc(col) : desc(col);
    const where = this.buildWhere(filters);

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(appointments)
      .where(where);

    const rows = await this.db
      .select(appointmentSelect)
      .from(appointments)
      .innerJoin(clients, eq(appointments.clientId, clients.id))
      .leftJoin(therapists, eq(appointments.therapistId, therapists.userId))
      .leftJoin(users, eq(therapists.userId, users.id))
      .leftJoin(treatments, eq(appointments.treatmentId, treatments.id))
      .where(where)
      .orderBy(orderExpr)
      .limit(limit)
      .offset((page - 1) * limit);

    return {
      data: rows.map((row) => this.mapRow(row as AppointmentQueryRow)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async one(filters: AppointmentFilters) {
    const [row] = await this.db
      .select(appointmentSelect)
      .from(appointments)
      .innerJoin(clients, eq(appointments.clientId, clients.id))
      .leftJoin(therapists, eq(appointments.therapistId, therapists.userId))
      .leftJoin(users, eq(therapists.userId, users.id))
      .leftJoin(treatments, eq(appointments.treatmentId, treatments.id))
      .where(this.buildWhere(filters));

    return row ? this.mapRow(row as AppointmentQueryRow) : null;
  }

  async findOrFail(id: number, filters: Omit<AppointmentFilters, "id"> = {}) {
    const appointment = await this.one({ id, ...filters });
    if (!appointment) throw new NotFoundError("Appointment not found");
    return appointment;
  }

  async create(data: CreateAppointmentBody) {
    const startedAt = new Date(data.startedAt);
    const endedAt = new Date(data.endedAt);
    if (endedAt <= startedAt) {
      throw new BadRequestError("endedAt must be after startedAt", null);
    }
    if (data.therapistId !== undefined) {
      await this.checkTherapistOverlap(data.therapistId, startedAt, endedAt);
    }
    const [row] = await this.db
      .insert(appointments)
      .values({
        therapistId: data.therapistId,
        clientId: data.clientId,
        treatmentId: data.treatmentId,
        startedAt,
        endedAt,
        notes: data.notes,
      })
      .returning();
    return (await this.one({ id: row!.id }))!;
  }

  async update(id: number, data: UpdateAppointmentBody) {
    const startedAt =
      data.startedAt !== undefined ? new Date(data.startedAt) : undefined;
    const endedAt =
      data.endedAt !== undefined ? new Date(data.endedAt) : undefined;

    const affectsSchedule =
      startedAt !== undefined || endedAt !== undefined || data.therapistId !== undefined;

    if (affectsSchedule) {
      const current = await this.findOrFail(id);
      const effectiveStart = startedAt ?? current.startedAt;
      const effectiveEnd = endedAt ?? current.endedAt;

      if (effectiveEnd <= effectiveStart) {
        throw new BadRequestError("endedAt must be after startedAt", null);
      }

      const effectiveTherapistId =
        data.therapistId ?? current.therapistId ?? undefined;
      if (effectiveTherapistId !== undefined) {
        await this.checkTherapistOverlap(
          effectiveTherapistId,
          effectiveStart,
          effectiveEnd,
          id,
        );
      }
    }

    await this.db
      .update(appointments)
      .set({
        therapistId: data.therapistId,
        clientId: data.clientId,
        treatmentId: data.treatmentId,
        startedAt,
        endedAt,
        notes: data.notes,
        updatedAt: new Date(),
      })
      .where(eq(appointments.id, id));

    return this.one({ id });
  }

  async destroy(id: number) {
    try {
      await this.db.delete(appointments).where(eq(appointments.id, id));
    } catch (e: any) {
      if (e?.code === "23503") {
        throw new ConflictError(
          `Cannot delete appointment: referenced by table '${e.table}'`,
        );
      }
      throw e;
    }
  }

  async updateStatus(
    id: number,
    data: UpdateAppointmentStatusBody,
    filters: Omit<AppointmentFilters, "id"> = {},
  ) {
    const appointment = await this.findOrFail(id, filters);
    const allowed = VALID_TRANSITIONS[appointment.status];

    if (!allowed.includes(data.status)) {
      throw new BadRequestError(
        `Cannot update status from '${appointment.status}' to '${data.status}'`,
        null,
      );
    }

    let cancellationReason: CancellationReason | null = null;
    let cancellationNote: string | null = null;

    if (data.status === "cancelled") {
      cancellationReason = data.cancellationReason;
      if (data.cancellationReason === "other") {
        if (!data.cancellationNote) {
          throw new BadRequestError(
            "cancellationNote is required when cancellationReason is 'other'",
            null,
          );
        }
        cancellationNote = data.cancellationNote;
      }
    }

    await this.db
      .update(appointments)
      .set({
        status: data.status,
        cancellationReason,
        cancellationNote,
        updatedAt: new Date(),
      })
      .where(eq(appointments.id, id));

    return (await this.one({ id, ...filters }))!;
  }

  private async checkTherapistOverlap(
    therapistId: number,
    startedAt: Date,
    endedAt: Date,
    excludeId?: number,
  ) {
    const [conflict] = await this.db
      .select({ id: appointments.id })
      .from(appointments)
      .where(
        and(
          eq(appointments.therapistId, therapistId),
          not(inArray(appointments.status, ["cancelled", "no_show"])),
          lt(appointments.startedAt, endedAt),
          gt(appointments.endedAt, startedAt),
          excludeId !== undefined ? not(eq(appointments.id, excludeId)) : undefined,
        ),
      )
      .limit(1);

    if (conflict) {
      throw new ConflictError(
        "Therapist already has an appointment in this time slot",
      );
    }
  }

  private mapRow(row: AppointmentQueryRow) {
    const {
      clientFirstName,
      clientLastName,
      clientBirthDate,
      clientPhone,
      clientEmail,
      clientPreferredCommunication,
      therapistSpeciality,
      therapistPhone,
      therapistIsActive,
      therapistFirstName,
      therapistLastName,
      therapistEmail,
      treatmentCategory,
      treatmentPricePerUnit,
      treatmentQuantity,
      treatmentTotalAmount,
      treatmentDurationMinutes,
      treatmentIsActive,
      ...appointment
    } = row;

    return {
      ...appointment,
      client: {
        id: appointment.clientId,
        firstName: clientFirstName,
        lastName: clientLastName,
        birthDate: clientBirthDate,
        phone: clientPhone,
        email: clientEmail,
        preferredCommunication: clientPreferredCommunication,
      },
      therapist:
        appointment.therapistId !== null
          ? {
              id: appointment.therapistId,
              firstName: therapistFirstName!,
              lastName: therapistLastName!,
              email: therapistEmail!,
              speciality: therapistSpeciality!,
              phone: therapistPhone!,
              isActive: therapistIsActive!,
            }
          : null,
      treatment:
        appointment.treatmentId !== null
          ? {
              id: appointment.treatmentId,
              category: treatmentCategory!,
              pricePerUnit: treatmentPricePerUnit!,
              quantity: treatmentQuantity!,
              totalAmount: treatmentTotalAmount,
              durationMinutes: treatmentDurationMinutes!,
              isActive: treatmentIsActive!,
            }
          : null,
    };
  }

  private buildWhere(filters: AppointmentFilters) {
    return and(
      filters.id !== undefined ? eq(appointments.id, filters.id) : undefined,
      filters.therapistId !== undefined
        ? eq(appointments.therapistId, filters.therapistId)
        : undefined,
      filters.clientId !== undefined
        ? eq(appointments.clientId, filters.clientId)
        : undefined,
      filters.status !== undefined
        ? eq(appointments.status, filters.status)
        : undefined,
      filters.dateFrom !== undefined
        ? gte(appointments.startedAt, new Date(filters.dateFrom))
        : undefined,
      filters.dateTo !== undefined
        ? lte(appointments.startedAt, new Date(filters.dateTo))
        : undefined,
    );
  }
}
