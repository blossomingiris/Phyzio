import type { DrizzleClient } from "#app/database/drizzle-client.ts";
import { therapists, users } from "#app/database/schemas.ts";
import { type Speciality } from "#app/database/types.ts";
import { type Pagination } from "#app/domains/shared/dto/index.ts";
import type {
  AdminCreateTherapistBody,
  AdminUpdateTherapistBody,
} from "#app/domains/users/therapists/users.therapist.dto.ts";
import { NotFoundError } from "#app/errors/httpErrors.ts";
import { and, count, desc, eq, ilike, or } from "drizzle-orm";

export interface TherapistFilters {
  id?: number;
  speciality?: Speciality;
  search?: string;
  isActive?: boolean;
}

const therapistSelect = {
  id: therapists.id,
  userId: therapists.userId,
  firstName: users.firstName,
  lastName: users.lastName,
  email: users.email,
  speciality: therapists.speciality,
  phone: therapists.phone,
  workingHours: therapists.workingHours,
  isActive: therapists.isActive,
  deletedAt: therapists.deletedAt,
  createdAt: therapists.createdAt,
  updatedAt: therapists.updatedAt,
};

export class TherapistsService {
  private db: DrizzleClient;

  constructor(db: DrizzleClient) {
    this.db = db;
  }

  async all(filters: TherapistFilters = {}, pagination: Pagination = {}) {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;
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
      .orderBy(desc(therapists.createdAt))
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

  async findOrFail(id: number) {
    const therapist = await this.one({ id });

    if (!therapist) {
      throw new NotFoundError("Therapist not found");
    }

    return therapist;
  }

  async create(data: AdminCreateTherapistBody) {
    const {
      firstName,
      lastName,
      email,
      password,
      speciality,
      phone,
      workingHours,
    } = data;

    return this.db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({ firstName, lastName, email, password, role: "therapist" })
        .returning();

      const [therapist] = await tx
        .insert(therapists)
        .values({ userId: user!.id, speciality, phone, workingHours })
        .returning();

      return { ...therapist!, firstName, lastName, email };
    });
  }

  async update(id: number, data: AdminUpdateTherapistBody) {
    await this.db
      .update(therapists)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(therapists.id, id));

    return this.findOrFail(id);
  }

  async destroy(id: number) {
    await this.db
      .update(therapists)
      .set({ deletedAt: new Date() })
      .where(eq(therapists.id, id));
  }

  private buildWhere(filters: TherapistFilters) {
    return and(
      filters.id !== undefined ? eq(therapists.id, filters.id) : undefined,
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
