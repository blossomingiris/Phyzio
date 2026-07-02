import { BILLING_VAT_RATE } from "#app/modules/general/billing.ts";
import type { DrizzleClient } from "#app/database/drizzle-client.ts";
import {
  clients,
  therapists,
  treatmentPlanItems,
  treatmentPlans,
  treatments,
  users,
} from "#app/database/schemas.ts";
import type {
  ClientCommunication,
  Speciality,
  TreatmentCategory,
  TreatmentPlanCancellationReason,
  TreatmentPlanStatus,
} from "#app/database/types.ts";
import { BadRequestError, ConflictError, NotFoundError, UnprocessableEntityError } from "#app/errors/httpErrors.ts";
import { getDbError } from "#app/errors/translateDbError.ts";
import type { Pagination } from "#app/modules/general/dto/index.ts";
import { and, asc, count, desc, eq, inArray, sql } from "drizzle-orm";
import type {
  AddTreatmentPlanItemBody,
  CreateTreatmentPlanBody,
  UpdateTreatmentPlanBody,
  UpdateTreatmentPlanStatusBody,
} from "./treatment-plans.resource.dto.ts";

type TreatmentPlanFilters = {
  id?: number;
  therapistId?: number;
  clientId?: number;
  status?: TreatmentPlanStatus;
};

type PlanSortBy = "createdAt" | "startDate" | "status";
type PlanSortParams = { sortBy?: PlanSortBy; sortOrder?: "asc" | "desc" };

type PlanHeaderRow = {
  id: number;
  therapistId: number;
  clientId: number;
  primaryDiagnostic: string;
  clinicalGoals: string;
  contraindications: string | null;
  status: TreatmentPlanStatus;
  cancellationReason: TreatmentPlanCancellationReason | null;
  cancellationNote: string | null;
  startDate: Date;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  clientFirstName: string;
  clientLastName: string;
  clientBirthDate: string | null;
  clientPhone: string | null;
  clientEmail: string | null;
  clientPreferredCommunication: ClientCommunication;
  therapistSpeciality: Speciality;
  therapistPhone: string;
  therapistIsActive: boolean;
  therapistFirstName: string;
  therapistLastName: string;
  therapistEmail: string;
};

type PlanItemRow = {
  id: number;
  treatmentPlanId: number;
  quantityCompleted: number;
  itemCreatedAt: Date;
  itemUpdatedAt: Date;
  treatmentId: number;
  treatmentCategory: TreatmentCategory;
  treatmentPricePerUnit: string;
  treatmentQuantity: number;
  treatmentTotalAmount: string | null;
  treatmentDurationMinutes: number;
  treatmentIsActive: boolean;
};

export const TERMINAL_STATUSES: TreatmentPlanStatus[] = ["completed", "cancelled"];

const MANUAL_TRANSITIONS: Record<TreatmentPlanStatus, TreatmentPlanStatus[]> = {
  open: ["cancelled"],
  in_progress: ["paused", "completed", "cancelled"],
  paused: ["in_progress", "cancelled"],
  completed: [],
  cancelled: [],
};

const PLAN_SORT_COLUMNS = {
  createdAt: treatmentPlans.createdAt,
  startDate: treatmentPlans.startDate,
  status: treatmentPlans.status,
} satisfies Record<PlanSortBy, unknown>;

const planHeaderSelect = {
  id: treatmentPlans.id,
  therapistId: treatmentPlans.therapistId,
  clientId: treatmentPlans.clientId,
  primaryDiagnostic: treatmentPlans.primaryDiagnostic,
  clinicalGoals: treatmentPlans.clinicalGoals,
  contraindications: treatmentPlans.contraindications,
  status: treatmentPlans.status,
  cancellationReason: treatmentPlans.cancellationReason,
  cancellationNote: treatmentPlans.cancellationNote,
  startDate: treatmentPlans.startDate,
  endDate: treatmentPlans.endDate,
  createdAt: treatmentPlans.createdAt,
  updatedAt: treatmentPlans.updatedAt,
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
};

const planItemSelect = {
  id: treatmentPlanItems.id,
  treatmentPlanId: treatmentPlanItems.treatmentPlanId,
  quantityCompleted: treatmentPlanItems.quantityCompleted,
  itemCreatedAt: treatmentPlanItems.createdAt,
  itemUpdatedAt: treatmentPlanItems.updatedAt,
  treatmentId: treatments.id,
  treatmentCategory: treatments.category,
  treatmentPricePerUnit: treatments.pricePerUnit,
  treatmentQuantity: treatments.quantity,
  treatmentTotalAmount: treatments.totalAmount,
  treatmentDurationMinutes: treatments.durationMinutes,
  treatmentIsActive: treatments.isActive,
};

export class TreatmentPlansService {
  private db: DrizzleClient;

  constructor(db: DrizzleClient) {
    this.db = db;
  }

  async all(
    filters: TreatmentPlanFilters = {},
    pagination: Pagination = {},
    sort: PlanSortParams = {},
  ) {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;
    const col = PLAN_SORT_COLUMNS[sort.sortBy ?? "createdAt"];
    const orderExpr = (sort.sortOrder ?? "desc") === "asc" ? asc(col) : desc(col);
    const where = this.buildWhere(filters);

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(treatmentPlans)
      .where(where);

    const rows = await this.db
      .select(planHeaderSelect)
      .from(treatmentPlans)
      .innerJoin(clients, eq(treatmentPlans.clientId, clients.id))
      .innerJoin(therapists, eq(treatmentPlans.therapistId, therapists.userId))
      .innerJoin(users, eq(therapists.userId, users.id))
      .where(where)
      .orderBy(orderExpr)
      .limit(limit)
      .offset((page - 1) * limit);

    return {
      data: rows.map((row) => this.mapHeaderRow(row as PlanHeaderRow)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async one(filters: TreatmentPlanFilters) {
    const [headerRow] = await this.db
      .select(planHeaderSelect)
      .from(treatmentPlans)
      .innerJoin(clients, eq(treatmentPlans.clientId, clients.id))
      .innerJoin(therapists, eq(treatmentPlans.therapistId, therapists.userId))
      .innerJoin(users, eq(therapists.userId, users.id))
      .where(this.buildWhere(filters));

    if (!headerRow) return null;

    const itemRows = await this.db
      .select(planItemSelect)
      .from(treatmentPlanItems)
      .innerJoin(treatments, eq(treatmentPlanItems.treatmentId, treatments.id))
      .where(eq(treatmentPlanItems.treatmentPlanId, headerRow.id));

    return {
      ...this.mapHeaderRow(headerRow as PlanHeaderRow),
      items: itemRows.map((row) => this.mapItemRow(row as PlanItemRow)),
    };
  }

  async findOrFail(id: number, filters: Omit<TreatmentPlanFilters, "id"> = {}) {
    const plan = await this.one({ id, ...filters });
    if (!plan) throw new NotFoundError("Treatment plan not found");
    return plan;
  }

  async create(data: CreateTreatmentPlanBody, therapistId: number) {
    await this.validateTreatmentItems(data.items.map((item) => item.treatmentId));

    let planId!: number;

    try {
      await this.db.transaction(async (tx) => {
        const [plan] = await tx
          .insert(treatmentPlans)
          .values({
            therapistId,
            clientId: data.clientId,
            primaryDiagnostic: data.primaryDiagnostic,
            clinicalGoals: data.clinicalGoals,
            contraindications: data.contraindications,
            startDate: new Date(data.startDate),
            endDate: data.endDate ? new Date(data.endDate) : null,
          })
          .returning({ id: treatmentPlans.id });

        planId = plan!.id;

        await tx.insert(treatmentPlanItems).values(
          data.items.map((item) => ({
            treatmentPlanId: planId,
            treatmentId: item.treatmentId,
          })),
        );
      });
    } catch (e) {
      if (getDbError(e)?.code === "23503")
        throw new UnprocessableEntityError("Invalid field value", [
          { field: "clientId", message: "Client not found" },
        ]);
      throw e;
    }

    return (await this.one({ id: planId }))!;
  }

  async update(id: number, data: UpdateTreatmentPlanBody) {
    const currentStatus = await this.getStatusOrFail(id);

    if (TERMINAL_STATUSES.includes(currentStatus)) {
      throw new UnprocessableEntityError(`Cannot update a ${currentStatus} plan`);
    }

    await this.db
      .update(treatmentPlans)
      .set({
        primaryDiagnostic: data.primaryDiagnostic,
        clinicalGoals: data.clinicalGoals,
        contraindications: data.contraindications,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate:
          data.endDate !== undefined
            ? data.endDate
              ? new Date(data.endDate)
              : null
            : undefined,
        updatedAt: new Date(),
      })
      .where(eq(treatmentPlans.id, id));

    return (await this.one({ id }))!;
  }

  async updateStatus(id: number, data: UpdateTreatmentPlanStatusBody) {
    const currentStatus = await this.getStatusOrFail(id);

    if (TERMINAL_STATUSES.includes(currentStatus)) {
      throw new UnprocessableEntityError(`Cannot update a ${currentStatus} plan`);
    }

    const allowed = MANUAL_TRANSITIONS[currentStatus];
    if (!allowed.includes(data.status)) {
      throw new UnprocessableEntityError(
        `Cannot transition from '${currentStatus}' to '${data.status}'`,
      );
    }

    let cancellationReason: TreatmentPlanCancellationReason | undefined;
    let cancellationNote: string | null | undefined;

    if (data.status === "cancelled") {
      cancellationReason = data.cancellationReason;
      if (data.cancellationReason === "other") {
        if (!data.cancellationNote) {
          throw new BadRequestError(
            "cancellationNote is required when cancellationReason is 'other'",
            [
              {
                field: "cancellationNote",
                message: "is required when cancellationReason is 'other'",
              },
            ],
          );
        }
        cancellationNote = data.cancellationNote;
      } else {
        cancellationNote = null;
      }
    }

    await this.db
      .update(treatmentPlans)
      .set({ status: data.status, cancellationReason, cancellationNote, updatedAt: new Date() })
      .where(eq(treatmentPlans.id, id));

    return (await this.one({ id }))!;
  }

  async addItem(planId: number, data: AddTreatmentPlanItemBody) {
    const currentStatus = await this.getStatusOrFail(planId);

    if (TERMINAL_STATUSES.includes(currentStatus)) {
      throw new UnprocessableEntityError(`Cannot add items to a ${currentStatus} plan`);
    }

    try {
      await this.db.insert(treatmentPlanItems).values({
        treatmentPlanId: planId,
        treatmentId: data.treatmentId,
      });
    } catch (e) {
      const code = getDbError(e)?.code;
      if (code === "23505")
        throw new ConflictError("This treatment is already in the plan");
      if (code === "23503")
        throw new UnprocessableEntityError("Invalid field value", [
          { field: "treatmentId", message: "Treatment not found" },
        ]);
      throw e;
    }

    return (await this.one({ id: planId }))!;
  }

  async removeItem(planId: number, itemId: number) {
    const [item] = await this.db
      .select()
      .from(treatmentPlanItems)
      .where(
        and(
          eq(treatmentPlanItems.id, itemId),
          eq(treatmentPlanItems.treatmentPlanId, planId),
        ),
      );

    if (!item) throw new NotFoundError("Plan item not found");

    if (item.quantityCompleted > 0) {
      throw new UnprocessableEntityError("Cannot remove an item with completed sessions");
    }

    await this.db.delete(treatmentPlanItems).where(eq(treatmentPlanItems.id, itemId));

    return (await this.one({ id: planId }))!;
  }

  async tryAdvanceToInProgress(planId: number) {
    const [plan] = await this.db
      .select({ status: treatmentPlans.status })
      .from(treatmentPlans)
      .where(eq(treatmentPlans.id, planId));

    if (plan?.status === "open") {
      await this.db
        .update(treatmentPlans)
        .set({ status: "in_progress", updatedAt: new Date() })
        .where(eq(treatmentPlans.id, planId));
    }
  }

  async creditItem(planId: number, itemId: number) {
    const [item] = await this.db
      .select({ id: treatmentPlanItems.id })
      .from(treatmentPlanItems)
      .where(
        and(
          eq(treatmentPlanItems.id, itemId),
          eq(treatmentPlanItems.treatmentPlanId, planId),
        ),
      );

    if (!item) throw new NotFoundError("Plan item not found");

    await this.db
      .update(treatmentPlanItems)
      .set({
        quantityCompleted: sql`${treatmentPlanItems.quantityCompleted} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(treatmentPlanItems.id, itemId));

    await this.checkAndAutoComplete(planId);
  }

  private async checkAndAutoComplete(planId: number) {
    const [plan] = await this.db
      .select({ status: treatmentPlans.status })
      .from(treatmentPlans)
      .where(eq(treatmentPlans.id, planId));

    if (plan?.status !== "in_progress") return;

    const items = await this.db
      .select({
        quantityCompleted: treatmentPlanItems.quantityCompleted,
        targetQuantity: treatments.quantity,
      })
      .from(treatmentPlanItems)
      .innerJoin(treatments, eq(treatmentPlanItems.treatmentId, treatments.id))
      .where(eq(treatmentPlanItems.treatmentPlanId, planId));

    const allDone =
      items.length > 0 && items.every((item) => item.quantityCompleted >= item.targetQuantity);

    if (allDone) {
      await this.db
        .update(treatmentPlans)
        .set({ status: "completed", updatedAt: new Date() })
        .where(eq(treatmentPlans.id, planId));
    }
  }

  private async getStatusOrFail(planId: number): Promise<TreatmentPlanStatus> {
    const [row] = await this.db
      .select({ status: treatmentPlans.status })
      .from(treatmentPlans)
      .where(eq(treatmentPlans.id, planId));
    if (!row) throw new NotFoundError("Treatment plan not found");
    return row.status;
  }

  private mapHeaderRow(row: PlanHeaderRow) {
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
      ...plan
    } = row;

    return {
      ...plan,
      client: {
        id: plan.clientId,
        firstName: clientFirstName,
        lastName: clientLastName,
        birthDate: clientBirthDate,
        phone: clientPhone,
        email: clientEmail,
        preferredCommunication: clientPreferredCommunication,
      },
      therapist: {
        id: plan.therapistId,
        firstName: therapistFirstName,
        lastName: therapistLastName,
        email: therapistEmail,
        speciality: therapistSpeciality,
        phone: therapistPhone,
        isActive: therapistIsActive,
      },
    };
  }

  private mapItemRow(row: PlanItemRow) {
    const {
      id,
      quantityCompleted,
      itemCreatedAt,
      itemUpdatedAt,
      treatmentId,
      treatmentCategory,
      treatmentPricePerUnit,
      treatmentQuantity,
      treatmentTotalAmount,
      treatmentDurationMinutes,
      treatmentIsActive,
    } = row;

    let vatAmount: string | null = null;
    let totalWithVat: string | null = null;

    if (treatmentTotalAmount !== null) {
      const total = parseFloat(treatmentTotalAmount);
      const vat = total * BILLING_VAT_RATE;
      vatAmount = vat.toFixed(2);
      totalWithVat = (total + vat).toFixed(2);
    }

    return {
      id,
      quantityCompleted,
      createdAt: itemCreatedAt,
      updatedAt: itemUpdatedAt,
      treatment: {
        id: treatmentId,
        category: treatmentCategory,
        pricePerUnit: treatmentPricePerUnit,
        quantity: treatmentQuantity,
        totalAmount: treatmentTotalAmount,
        vatRate: BILLING_VAT_RATE,
        vatAmount,
        totalWithVat,
        durationMinutes: treatmentDurationMinutes,
        isActive: treatmentIsActive,
      },
    };
  }

  private async validateTreatmentItems(itemIds: number[]) {
    const uniqueIds = [...new Set(itemIds)];

    const rows = await this.db
      .select({ id: treatments.id, isActive: treatments.isActive })
      .from(treatments)
      .where(inArray(treatments.id, uniqueIds));

    const foundIds = new Set(rows.map((r) => r.id));
    const missingIds = uniqueIds.filter((id) => !foundIds.has(id));
    if (missingIds.length > 0) {
      throw new NotFoundError(`Treatments not found: ${missingIds.join(", ")}`);
    }

    const inactiveIds = rows.filter((r) => !r.isActive).map((r) => r.id);
    if (inactiveIds.length > 0) {
      throw new UnprocessableEntityError(
        `Treatments are inactive: ${inactiveIds.join(", ")}`,
        inactiveIds.map((id) => ({
          field: "items",
          message: `Treatment ${id} is inactive`,
        })),
      );
    }
  }

  private buildWhere(filters: TreatmentPlanFilters) {
    return and(
      filters.id !== undefined ? eq(treatmentPlans.id, filters.id) : undefined,
      filters.therapistId !== undefined
        ? eq(treatmentPlans.therapistId, filters.therapistId)
        : undefined,
      filters.clientId !== undefined
        ? eq(treatmentPlans.clientId, filters.clientId)
        : undefined,
      filters.status !== undefined ? eq(treatmentPlans.status, filters.status) : undefined,
    );
  }
}
