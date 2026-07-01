import type { DrizzleClient } from "#app/database/drizzle-client.ts";
import { users } from "#app/database/schemas.ts";
import type { User, UserRole } from "#app/database/types.ts";
import { ConflictError, NotFoundError } from "#app/errors/httpErrors.ts";
import { getDbError } from "#app/errors/translateDbError.ts";
import type {
  UserSortBy,
  UserSortParams,
} from "#app/modules/domains/users/users.admin.dto.ts";
import { type Pagination } from "#app/modules/general/dto/index.ts";
import { and, asc, count, desc, eq, ilike, or } from "drizzle-orm";

type UpdateUser = Partial<Pick<User, "firstName" | "lastName" | "email">>;
type CreateUser = Pick<
  User,
  "firstName" | "lastName" | "email" | "role" | "password"
>;
type UserFilters = {
  id?: number;
  email?: string;
  role?: UserRole;
  search?: string;
};

const USER_SORT_COLUMNS = {
  createdAt: users.createdAt,
  lastName: users.lastName,
  email: users.email,
} satisfies Record<UserSortBy, unknown>;

export class UsersService {
  private db: DrizzleClient;

  constructor(db: DrizzleClient) {
    this.db = db;
  }

  async all(
    filters: UserFilters = {},
    pagination: Pagination = {},
    sort: UserSortParams = {},
  ) {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;
    const col = USER_SORT_COLUMNS[sort.sortBy ?? "createdAt"];
    const orderExpr =
      (sort.sortOrder ?? "desc") === "asc" ? asc(col) : desc(col);
    const where = this.buildWhere(filters);

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(users)
      .where(where);

    const data = await this.db
      .select()
      .from(users)
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
    try {
      const [user] = await this.db
        .insert(users)
        .values({ ...data, email: data.email.toLowerCase() })
        .returning();
      return user!;
    } catch (e) {
      if (getDbError(e)?.code === "23505")
        throw new ConflictError("Email already in use");
      throw e;
    }
  }

  async update(id: number, data: UpdateUser) {
    const normalized =
      data.email !== undefined
        ? { ...data, email: data.email.toLowerCase() }
        : data;
    const [user] = await this.db
      .update(users)
      .set({ ...normalized, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    return user ?? null;
  }

  async updatePassword(id: number, password: string) {
    const [user] = await this.db
      .update(users)
      .set({ password, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    return user ?? null;
  }

  async updateRole(id: number, role: UserRole) {
    const [user] = await this.db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    return user ?? null;
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
