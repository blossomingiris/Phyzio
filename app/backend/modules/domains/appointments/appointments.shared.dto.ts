import {
  appointmentStatusEnum,
  cancellationReasonEnum,
  categoryEnum,
} from "#app/database/schemas.ts";
import type {
  AppointmentStatus,
  CancellationReason,
  TreatmentCategory,
} from "#app/database/types.ts";
import {
  clientSummarySchema,
  paginationMeta,
  sortParamsSchema,
  therapistSummarySchema,
} from "#app/modules/general/dto/index.ts";
import Type, { type Static } from "typebox";

export const appointmentStatusSchema = Type.Unsafe<AppointmentStatus>({
  type: "string",
  enum: appointmentStatusEnum.enumValues,
});

export const cancellationReasonSchema = Type.Unsafe<CancellationReason>({
  type: "string",
  enum: cancellationReasonEnum.enumValues,
});

const treatmentCategorySchema = Type.Unsafe<TreatmentCategory>({
  type: "string",
  enum: categoryEnum.enumValues,
});

export const treatmentSummarySchema = Type.Object({
  id: Type.Integer(),
  category: treatmentCategorySchema,
  pricePerUnit: Type.String({ description: "Decimal as string" }),
  quantity: Type.Integer(),
  totalAmount: Type.Union([Type.String(), Type.Null()]),
  durationMinutes: Type.Integer(),
  isActive: Type.Boolean(),
});

export const appointmentResponse = Type.Object({
  id: Type.Integer(),
  therapist: Type.Union([therapistSummarySchema, Type.Null()]),
  client: clientSummarySchema,
  treatment: Type.Union([treatmentSummarySchema, Type.Null()]),
  startedAt: Type.String({ format: "date-time" }),
  endedAt: Type.String({ format: "date-time" }),
  notes: Type.Union([Type.String(), Type.Null()]),
  status: appointmentStatusSchema,
  cancellationReason: Type.Union([cancellationReasonSchema, Type.Null()]),
  cancellationNote: Type.Union([Type.String(), Type.Null()]),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
});

export const appointmentListResponse = Type.Object({
  data: Type.Array(appointmentResponse),
  pagination: Type.Object(paginationMeta),
});

export type AppointmentSortBy = "startedAt" | "createdAt";

export const appointmentSortBySchema = Type.Optional(
  Type.Unsafe<AppointmentSortBy>({
    type: "string",
    enum: ["startedAt", "createdAt"],
    default: "startedAt",
  }),
);

const appointmentSortParamsSchema = sortParamsSchema(appointmentSortBySchema);
export type AppointmentSortParams = Static<typeof appointmentSortParamsSchema>;

export const appointmentBaseBody = Type.Object(
  {
    therapistId: Type.Optional(Type.Integer({ minimum: 1 })),
    clientId: Type.Integer({ minimum: 1 }),
    treatmentId: Type.Optional(Type.Integer({ minimum: 1 })),
    startedAt: Type.String({ format: "date-time" }),
    endedAt: Type.String({ format: "date-time" }),
    notes: Type.Optional(Type.String()),
  },
  { additionalProperties: false },
);

export const cancelledTransitionSchema = Type.Object(
  {
    status: Type.Literal("cancelled"),
    cancellationReason: cancellationReasonSchema,
    cancellationNote: Type.Optional(
      Type.String({ description: "Required when reason is 'other'" }),
    ),
  },
  { additionalProperties: false },
);

export const nonCancelledTransitionSchema = Type.Object(
  {
    status: Type.Unsafe<Exclude<AppointmentStatus, "cancelled">>({
      type: "string",
      enum: appointmentStatusEnum.enumValues.filter((s) => s !== "cancelled"),
    }),
  },
  { additionalProperties: false },
);
