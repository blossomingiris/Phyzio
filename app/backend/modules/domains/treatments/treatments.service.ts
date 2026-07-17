import { BILLING_VAT_RATE } from "#app/modules/general/billing.ts";
import type { DrizzleClient } from "#app/database/drizzle-client.ts";
import { treatments } from "#app/database/schemas.ts";
import type { TreatmentCategory } from "#app/database/types.ts";
import { NotFoundError } from "#app/errors/httpErrors.ts";
import type { Pagination } from "#app/modules/general/dto/index.ts";
import { asc, count, desc, eq, ilike, and } from "drizzle-orm";
import type {
  CreateTreatmentBody,
  TreatmentSortBy,
  UpdateTreatmentBody,
} from "./treatments.admin.dto.ts";

type TreatmentFilters = {
  id?: number;
  category?: TreatmentCategory;
  isActive?: boolean;
  search?: string;
};

type TreatmentSortParams = {
  sortBy?: TreatmentSortBy;
  sortOrder?: "asc" | "desc";
};

const TREATMENT_SORT_COLUMNS = {
  createdAt: treatments.createdAt,
  category: treatments.category,
  pricePerUnit: treatments.pricePerUnit,
  durationMinutes: treatments.durationMinutes,
  quantity: treatments.quantity,
} satisfies Record<TreatmentSortBy, unknown>;

export class TreatmentsService {
  private db: DrizzleClient;

  constructor(db: DrizzleClient) {
    this.db = db;
  }

  async all(
    filters: TreatmentFilters = {},
    pagination: Pagination = {},
    sort: TreatmentSortParams = {},
  ) {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;
    const col = TREATMENT_SORT_COLUMNS[sort.sortBy ?? "createdAt"];
    const orderExpr =
      (sort.sortOrder ?? "desc") === "asc" ? asc(col) : desc(col);
    const where = this.buildWhere(filters);

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(treatments)
      .where(where);

    const rows = await this.db
      .select()
      .from(treatments)
      .where(where)
      .orderBy(orderExpr)
      .limit(limit)
      .offset((page - 1) * limit);

    return {
      data: rows.map((row) => this.mapRow(row)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async one(filters: TreatmentFilters) {
    const [row] = await this.db
      .select()
      .from(treatments)
      .where(this.buildWhere(filters));

    return row ? this.mapRow(row) : null;
  }

  async findOrFail(id: number) {
    const treatment = await this.one({ id });
    if (!treatment) throw new NotFoundError("Treatment not found");
    return treatment;
  }

  async create(data: CreateTreatmentBody) {
    const [row] = await this.db
      .insert(treatments)
      .values({
        name: data.name,
        description: data.description,
        category: data.category,
        pricePerUnit: data.pricePerUnit,
        quantity: data.quantity,
        durationMinutes: data.durationMinutes,
      })
      .returning();

    return this.mapRow(row!);
  }

  async update(id: number, data: UpdateTreatmentBody) {
    await this.findOrFail(id);

    await this.db
      .update(treatments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(treatments.id, id));

    return (await this.one({ id }))!;
  }

  private mapRow(row: typeof treatments.$inferSelect) {
    const { totalAmount, ...rest } = row;

    let vatAmount: string | null = null;
    let totalWithVat: string | null = null;

    if (totalAmount !== null) {
      const total = parseFloat(totalAmount);
      const vat = total * BILLING_VAT_RATE;
      vatAmount = vat.toFixed(2);
      totalWithVat = (total + vat).toFixed(2);
    }

    return {
      ...rest,
      totalAmount,
      vatRate: BILLING_VAT_RATE,
      vatAmount,
      totalWithVat,
    };
  }

  private buildWhere(filters: TreatmentFilters) {
    return and(
      filters.id !== undefined ? eq(treatments.id, filters.id) : undefined,
      filters.category !== undefined
        ? eq(treatments.category, filters.category)
        : undefined,
      filters.isActive !== undefined
        ? eq(treatments.isActive, filters.isActive)
        : undefined,
      filters.search !== undefined
        ? ilike(treatments.name, `%${filters.search}%`)
        : undefined,
    );
  }
}
