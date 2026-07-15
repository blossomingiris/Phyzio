import { categoryEnum } from "#app/database/schemas.ts";
import type { TreatmentCategory } from "#app/database/types.ts";
import {
  errorResponse,
  paramId,
  paginationMetaResponse,
  sortOrderSchema,
  fieldErrorResponse,
} from "#app/modules/general/dto/index.ts";
import Type, { type Static } from "typebox";

export const treatmentCategorySchema = Type.Unsafe<TreatmentCategory>({
  type: "string",
  enum: categoryEnum.enumValues,
});

export type TreatmentSortBy =
  | "createdAt"
  | "category"
  | "pricePerUnit"
  | "durationMinutes";

const treatmentSortBySchema = Type.Optional(
  Type.Unsafe<TreatmentSortBy>({
    type: "string",
    enum: ["createdAt", "category", "pricePerUnit", "durationMinutes"],
    default: "createdAt",
  }),
);

export const treatmentResponse = Type.Object({
  id: Type.Integer(),
  category: treatmentCategorySchema,
  pricePerUnit: Type.String({ description: "Decimal as string" }),
  quantity: Type.Integer(),
  totalAmount: Type.Union([Type.String(), Type.Null()]),
  vatRate: Type.Number({ description: "Applied VAT rate, e.g. 0.24 for 24%" }),
  vatAmount: Type.Union([Type.String(), Type.Null()], { description: "VAT portion as decimal string" }),
  totalWithVat: Type.Union([Type.String(), Type.Null()], { description: "totalAmount + vatAmount as decimal string" }),
  durationMinutes: Type.Integer(),
  isActive: Type.Boolean(),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
});

export const treatmentListResponse = Type.Object({
  data: Type.Array(treatmentResponse),
  pagination: paginationMetaResponse,
});

export const createTreatmentBody = Type.Object(
  {
    category: treatmentCategorySchema,
    pricePerUnit: Type.String({
      pattern: "^\\d+(\\.\\d{1,2})?$",
      description: "Decimal as string, e.g. '50.00'",
    }),
    quantity: Type.Integer({ minimum: 1 }),
    durationMinutes: Type.Integer({ minimum: 1 }),
  },
  { additionalProperties: false },
);
export type CreateTreatmentBody = Static<typeof createTreatmentBody>;

export const updateTreatmentBody = Type.Object(
  {
    category: Type.Optional(treatmentCategorySchema),
    pricePerUnit: Type.Optional(
      Type.String({
        pattern: "^\\d+(\\.\\d{1,2})?$",
        description: "Decimal as string, e.g. '50.00'",
      }),
    ),
    quantity: Type.Optional(Type.Integer({ minimum: 1 })),
    durationMinutes: Type.Optional(Type.Integer({ minimum: 1 })),
    isActive: Type.Optional(Type.Boolean()),
  },
  { additionalProperties: false },
);
export type UpdateTreatmentBody = Static<typeof updateTreatmentBody>;

export const listTreatmentsQuery = Type.Object(
  {
    page: Type.Optional(Type.Integer({ minimum: 1, default: 1 })),
    limit: Type.Optional(
      Type.Integer({ minimum: 1, maximum: 100, default: 20 }),
    ),
    category: Type.Optional(treatmentCategorySchema),
    isActive: Type.Optional(Type.Boolean()),
    sortBy: treatmentSortBySchema,
    sortOrder: sortOrderSchema,
  },
  { additionalProperties: false },
);
export type ListTreatmentsQuery = Static<typeof listTreatmentsQuery>;

const tag = { tags: ["Admin / Treatments"] as const };

export const listTreatmentsSchema = {
  ...tag,
  summary: "List all treatments",
  querystring: listTreatmentsQuery,
  response: {
    200: treatmentListResponse,
    400: fieldErrorResponse,
    401: errorResponse,
    403: errorResponse,
  },
};

export const findTreatmentSchema = {
  ...tag,
  summary: "Get a treatment by ID",
  params: paramId,
  response: {
    200: treatmentResponse,
    400: fieldErrorResponse,
    401: errorResponse,
    403: errorResponse,
    404: errorResponse,
  },
};

export const createTreatmentSchema = {
  ...tag,
  summary: "Create a treatment",
  body: createTreatmentBody,
  response: {
    201: treatmentResponse,
    400: fieldErrorResponse,
    401: errorResponse,
    403: errorResponse,
  },
};

export const updateTreatmentSchema = {
  ...tag,
  summary: "Update a treatment",
  params: paramId,
  body: updateTreatmentBody,
  response: {
    200: treatmentResponse,
    400: fieldErrorResponse,
    401: errorResponse,
    403: errorResponse,
    404: errorResponse,
  },
};
