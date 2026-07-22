import type { DrizzleClient } from "#app/database/drizzle-client.ts";
import { clients, therapists, treatmentPlans, users } from "#app/database/schemas.ts";
import type { Speciality } from "#app/database/types.ts";
import { ConflictError, NotFoundError, UnprocessableEntityError } from "#app/errors/httpErrors.ts";
import { getDbError } from "#app/errors/translateDbError.ts";
import { type Pagination } from "#app/modules/general/dto/index.ts";
import { and, asc, count, desc, eq, ilike, inArray, isNull, not, or } from "drizzle-orm";
import type {
  CreateClientBody,
  UpdateClientBody,
} from "./clients.admin.dto.ts";
import type { ClientSortBy, ClientSortParams } from "./clients.shared.dto.ts";

const NON_TERMINAL_PLAN_STATUSES = ["open", "in_progress", "paused"] as const;

type ClientFilters = {
  id?: number;
  therapistId?: number;
  search?: string;
  status?: "active" | "all" | "deleted";
};

type ClientQueryRow = typeof clients.$inferSelect & {
  therapistSpeciality: Speciality | null;
  therapistPhone: string | null;
  therapistIsActive: boolean | null;
  therapistFirstName: string | null;
  therapistLastName: string | null;
  therapistEmail: string | null;
};

const CLIENT_SORT_COLUMNS = {
  createdAt: clients.createdAt,
  lastName: clients.lastName,
} satisfies Record<ClientSortBy, unknown>;

const clientSelect = {
  id: clients.id,
  therapistId: clients.therapistId,
  firstName: clients.firstName,
  lastName: clients.lastName,
  birthDate: clients.birthDate,
  phone: clients.phone,
  email: clients.email,
  origin: clients.origin,
  preferredCommunication: clients.preferredCommunication,
  medicalNotes: clients.medicalNotes,
  deletedAt: clients.deletedAt,
  createdAt: clients.createdAt,
  updatedAt: clients.updatedAt,
  therapistSpeciality: therapists.speciality,
  therapistPhone: therapists.phone,
  therapistIsActive: therapists.isActive,
  therapistFirstName: users.firstName,
  therapistLastName: users.lastName,
  therapistEmail: users.email,
};

export class ClientsService {
  private db: DrizzleClient;

  constructor(db: DrizzleClient) {
    this.db = db;
  }

  async all(
    filters: ClientFilters = {},
    pagination: Pagination = {},
    sort: ClientSortParams = {},
  ) {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;
    const col = CLIENT_SORT_COLUMNS[sort.sortBy ?? "createdAt"];
    const orderExpr =
      (sort.sortOrder ?? "desc") === "asc" ? asc(col) : desc(col);
    const where = this.buildWhere(filters);

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(clients)
      .where(where);

    const rows = await this.db
      .select(clientSelect)
      .from(clients)
      .leftJoin(therapists, eq(clients.therapistId, therapists.userId))
      .leftJoin(users, eq(therapists.userId, users.id))
      .where(where)
      .orderBy(orderExpr)
      .limit(limit)
      .offset((page - 1) * limit);

    return {
      data: rows.map((row) => this.mapRow(row as ClientQueryRow)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async one(filters: ClientFilters) {
    const [row] = await this.db
      .select(clientSelect)
      .from(clients)
      .leftJoin(therapists, eq(clients.therapistId, therapists.userId))
      .leftJoin(users, eq(therapists.userId, users.id))
      .where(this.buildWhere(filters));

    return row ? this.mapRow(row as ClientQueryRow) : null;
  }

  async findOrFail(id: number, filters: Omit<ClientFilters, "id"> = {}) {
    const client = await this.one({ id, ...filters });

    if (!client) {
      throw new NotFoundError("Client not found");
    }

    return client;
  }

  async create(data: CreateClientBody) {
    const normalized =
      data.email !== undefined
        ? { ...data, email: data.email.toLowerCase() }
        : data;
    try {
      const [row] = await this.db
        .insert(clients)
        .values(normalized)
        .returning();
      return (await this.one({ id: row!.id }))!;
    } catch (e) {
      const code = getDbError(e)?.code;
      if (code === "23505") throw new ConflictError("Email already in use");
      if (code === "23503")
        throw new UnprocessableEntityError("Invalid field value", [
          { field: "therapistId", message: "Therapist not found" },
        ]);
      throw e;
    }
  }

  async update(id: number, data: UpdateClientBody) {
    const normalized =
      data.email !== undefined
        ? { ...data, email: data.email.toLowerCase() }
        : data;
    if (normalized.email !== undefined) {
      const [conflict] = await this.db
        .select({ id: clients.id })
        .from(clients)
        .where(
          and(eq(clients.email, normalized.email), not(eq(clients.id, id))),
        );
      if (conflict) throw new ConflictError("Email already in use");
    }

    try {
      await this.db
        .update(clients)
        .set({ ...normalized, updatedAt: new Date() })
        .where(eq(clients.id, id));
    } catch (e) {
      const code = getDbError(e)?.code;
      if (code === "23505") throw new ConflictError("Email already in use");
      if (code === "23503")
        throw new UnprocessableEntityError("Invalid field value", [
          { field: "therapistId", message: "Therapist not found" },
        ]);
      throw e;
    }

    return this.one({ id });
  }

  async destroy(id: number) {
    await this.db.transaction(async (tx) => {
      await tx
        .update(clients)
        .set({ deletedAt: new Date() })
        .where(eq(clients.id, id));

      const now = new Date();
      await tx
        .update(treatmentPlans)
        .set({
          status: "cancelled",
          cancellationReason: "client_deleted",
          cancellationNote: null,
          endDate: now,
          updatedAt: now,
        })
        .where(
          and(
            eq(treatmentPlans.clientId, id),
            inArray(treatmentPlans.status, NON_TERMINAL_PLAN_STATUSES),
          ),
        );
    });
  }

  private mapRow(row: ClientQueryRow) {
    const {
      therapistSpeciality,
      therapistPhone,
      therapistIsActive,
      therapistFirstName,
      therapistLastName,
      therapistEmail,
      ...client
    } = row;

    const therapist =
      client.therapistId !== null
        ? {
            id: client.therapistId,
            firstName: therapistFirstName!,
            lastName: therapistLastName!,
            email: therapistEmail!,
            speciality: therapistSpeciality!,
            phone: therapistPhone!,
            isActive: therapistIsActive!,
          }
        : null;

    if (client.deletedAt) {
      return {
        ...client,
        phone: null,
        email: null,
        birthDate: null,
        origin: null,
        preferredCommunication: null,
        medicalNotes: null,
        therapist,
      };
    }

    return { ...client, therapist };
  }

  private buildWhere(filters: ClientFilters) {
    return and(
      filters.status === "deleted"
        ? not(isNull(clients.deletedAt))
        : filters.status === "all"
          ? undefined
          : isNull(clients.deletedAt),
      filters.id !== undefined ? eq(clients.id, filters.id) : undefined,
      filters.therapistId !== undefined
        ? eq(clients.therapistId, filters.therapistId)
        : undefined,
      filters.search !== undefined
        ? or(
            ilike(clients.firstName, `%${filters.search}%`),
            ilike(clients.lastName, `%${filters.search}%`),
          )
        : undefined,
    );
  }
}
