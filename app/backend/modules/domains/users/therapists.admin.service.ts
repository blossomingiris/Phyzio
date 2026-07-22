import { AUTH_BCRYPT_ROUNDS } from "#app/config/auth.ts";
import type { DrizzleClient } from "#app/database/drizzle-client.ts";
import { therapists, treatmentPlans, users } from "#app/database/schemas.ts";
import { type Speciality } from "#app/database/types.ts";
import { ConflictError, NotFoundError } from "#app/errors/httpErrors.ts";
import { getDbError } from "#app/errors/translateDbError.ts";
import bcrypt from "bcrypt";
import type {
  CreateTherapistBody,
  TherapistSortBy,
  TherapistSortParams,
  UpdateTherapistBody,
} from "#app/modules/domains/users/therapists.admin.dto.ts";
import { type Pagination } from "#app/modules/general/dto/index.ts";
import { and, asc, count, desc, eq, ilike, isNull, not, or } from "drizzle-orm";

type TherapistFilters = {
  id?: number;
  speciality?: Speciality;
  search?: string;
  isActive?: boolean;
  status?: "active" | "all" | "deleted";
};

const THERAPIST_SORT_COLUMNS = {
  createdAt: users.createdAt,
  lastName: users.lastName,
  email: users.email,
} satisfies Record<TherapistSortBy, unknown>;

const therapistSelect = {
  id: users.id,
  firstName: users.firstName,
  lastName: users.lastName,
  email: users.email,
  speciality: therapists.speciality,
  phone: therapists.phone,
  workingHours: therapists.workingHours,
  isActive: therapists.isActive,
  deletedAt: therapists.deletedAt,
  createdAt: users.createdAt,
  updatedAt: therapists.updatedAt,
};

export class TherapistsService {
  private db: DrizzleClient;

  constructor(db: DrizzleClient) {
    this.db = db;
  }

  async all(
    filters: TherapistFilters = {},
    pagination: Pagination = {},
    sort: TherapistSortParams = {},
  ) {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;
    const col = THERAPIST_SORT_COLUMNS[sort.sortBy ?? "createdAt"];
    const orderExpr =
      (sort.sortOrder ?? "desc") === "asc" ? asc(col) : desc(col);
    const where = this.buildWhere(filters);

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(therapists)
      .innerJoin(users, eq(therapists.userId, users.id))
      .where(where);

    const data = await this.db
      .select(therapistSelect)
      .from(therapists)
      .innerJoin(users, eq(therapists.userId, users.id))
      .where(where)
      .orderBy(orderExpr)
      .limit(limit)
      .offset((page - 1) * limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async one(filters: TherapistFilters) {
    const [row] = await this.db
      .select(therapistSelect)
      .from(therapists)
      .innerJoin(users, eq(therapists.userId, users.id))
      .where(this.buildWhere(filters));

    return row ?? null;
  }

  async findOrFail(id: number, filters: Omit<TherapistFilters, "id"> = {}) {
    const therapist = await this.one({ id, ...filters });

    if (!therapist) {
      throw new NotFoundError("Therapist not found");
    }

    return therapist;
  }

  async create(data: CreateTherapistBody) {
    const {
      firstName,
      lastName,
      email,
      password,
      speciality,
      phone,
      workingHours,
    } = data;

    const hashedPassword = await bcrypt.hash(password, AUTH_BCRYPT_ROUNDS);

    try {
      return await this.db.transaction(async (tx) => {
        const [user] = await tx
          .insert(users)
          .values({ firstName, lastName, email, password: hashedPassword, role: "therapist" })
          .returning();

        const [therapist] = await tx
          .insert(therapists)
          .values({ userId: user!.id, speciality, phone, workingHours })
          .returning();

        const { userId, ...therapistRest } = therapist!;
        return { id: userId, firstName, lastName, email, ...therapistRest };
      });
    } catch (e) {
      if (getDbError(e)?.code === "23505")
        throw new ConflictError("Email already in use");
      throw e;
    }
  }

  async update(id: number, data: UpdateTherapistBody) {
    await this.db.transaction(async (tx) => {
      await tx
        .update(therapists)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(therapists.userId, id));

      if (data.isActive === false) {
        await tx
          .update(treatmentPlans)
          .set({ status: "paused", updatedAt: new Date() })
          .where(
            and(
              eq(treatmentPlans.therapistId, id),
              eq(treatmentPlans.status, "in_progress"),
            ),
          );
      }
    });

    return this.one({ id });
  }

  async destroy(id: number) {
    await this.db
      .update(therapists)
      .set({ deletedAt: new Date() })
      .where(eq(therapists.userId, id));
  }

  private buildWhere(filters: TherapistFilters) {
    return and(
      filters.status === "deleted"
        ? not(isNull(therapists.deletedAt))
        : filters.status === "all"
          ? undefined
          : isNull(therapists.deletedAt),
      filters.id !== undefined ? eq(therapists.userId, filters.id) : undefined,
      filters.speciality !== undefined
        ? eq(therapists.speciality, filters.speciality)
        : undefined,
      filters.isActive !== undefined
        ? eq(therapists.isActive, filters.isActive)
        : undefined,
      filters.search !== undefined
        ? or(
            ilike(users.firstName, `%${filters.search}%`),
            ilike(users.lastName, `%${filters.search}%`),
          )
        : undefined,
    );
  }
}
