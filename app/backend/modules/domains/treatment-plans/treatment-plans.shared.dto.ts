import {
  categoryEnum,
  planCancellationReasonEnum,
  planStatusEnum,
} from "#app/database/schemas.ts";
import type {
  TreatmentCategory,
  TreatmentPlanCancellationReason,
  TreatmentPlanStatus,
} from "#app/database/types.ts";
import Type from "typebox";

export const planStatusSchema = Type.Unsafe<TreatmentPlanStatus>({
  type: "string",
  enum: planStatusEnum.enumValues,
});

export const planCancellationReasonSchema = Type.Unsafe<TreatmentPlanCancellationReason>({
  type: "string",
  enum: planCancellationReasonEnum.enumValues,
});

export const treatmentCategorySchema = Type.Unsafe<TreatmentCategory>({
  type: "string",
  enum: categoryEnum.enumValues,
});

const treatmentSummarySchema = Type.Object({
  id: Type.Integer(),
  name: Type.String(),
  category: treatmentCategorySchema,
  pricePerUnit: Type.String({ description: "Decimal as string" }),
  quantity: Type.Integer(),
  totalAmount: Type.Union([Type.String(), Type.Null()]),
  vatRate: Type.Number({ description: "Applied VAT rate, e.g. 0.24 for 24%" }),
  vatAmount: Type.Union([Type.String(), Type.Null()], { description: "VAT portion as decimal string" }),
  totalWithVat: Type.Union([Type.String(), Type.Null()], { description: "totalAmount + vatAmount as decimal string" }),
  durationMinutes: Type.Integer(),
  isActive: Type.Boolean(),
});

export const treatmentPlanItemResponse = Type.Object({
  id: Type.Integer(),
  treatment: treatmentSummarySchema,
  quantityCompleted: Type.Integer(),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
});

export const planCancelledStatusSchema = Type.Object(
  {
    status: Type.Literal("cancelled"),
    cancellationReason: planCancellationReasonSchema,
    cancellationNote: Type.Optional(
      Type.String({ description: "Required when reason is 'other'" }),
    ),
  },
  { additionalProperties: false },
);

export const planSortBySchema = Type.Optional(
  Type.Unsafe<"createdAt" | "startDate" | "status">({
    type: "string",
    enum: ["createdAt", "startDate", "status"],
    default: "createdAt",
  }),
);
