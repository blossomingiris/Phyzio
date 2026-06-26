import type { DrizzleClient } from "#app/database/drizzle-client.ts";
import { users } from "#app/database/schemas.ts";
import type { User, UserRole } from "#app/database/types.ts";
import { type Pagination } from "#app/domains/shared/dto/index.ts";
import { NotFoundError } from "#app/errors/httpErrors.ts";
import { and, count, desc, eq, ilike, or } from "drizzle-orm";

type UpdateUser = Partial<Pick<User, "firstName" | "lastName" | "email">>;
type CreateUser = Pick<
  User,
  "firstName" | "lastName" | "email" | "role" | "password"
>;

export interface UserFilters {
  id?: number;
  email?: string;
  role?: UserRole;
  search?: string;
}

export class UsersService {
  private db: DrizzleClient;

  constructor(db: DrizzleClient) {
    this.db = db;
  }

  async all(filters: UserFilters = {}, pagination: Pagination = {}) {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;
    const where = this.buildWhere(filters);

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(users)
      .where(where);

    const data = await this.db
      .select()
      .from(users)
      .where(where)
      .orderBy(desc(users.createdAt))
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

  async one(filters: UserFilters) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(this.buildWhere(filters));

    return user ?? null;
  }

  async findOrFail(id: number) {
    const user = await this.one({ id });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user;
  }

  async create(data: CreateUser) {
    const [user] = await this.db.insert(users).values(data).returning();
    return user!;
  }

  async update(id: number, data: UpdateUser) {
    const [user] = await this.db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    return user!;
  }

  async updateRole(id: number, role: UserRole) {
    const [user] = await this.db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    return user!;
  }

  private buildWhere(filters: UserFilters) {
    return and(
      filters.id !== undefined ? eq(users.id, filters.id) : undefined,
      filters.email !== undefined ? eq(users.email, filters.email) : undefined,
      filters.role !== undefined ? eq(users.role, filters.role) : undefined,
      filters.search !== undefined
        ? or(
            ilike(users.firstName, `%${filters.search}%`),
            ilike(users.lastName, `%${filters.search}%`),
          )
        : undefined,
    );
  }
}
