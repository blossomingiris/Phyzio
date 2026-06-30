import {
  clientSummarySchema,
  errorResponse,
  paginationMeta,
  paramId,
  sortOrderSchema,
  therapistSummarySchema,
  validationErrorResponse,
} from "#app/modules/general/dto/index.ts";
import Type, { type Static } from "typebox";
import {
  planCancellationReasonSchema,
  planCancelledStatusSchema,
  planSortBySchema,
  planStatusSchema,
  treatmentPlanItemResponse,
} from "./treatment-plans.shared.dto.ts";

export const treatmentPlanAdminResponse = Type.Object({
  id: Type.Integer(),
  therapist: therapistSummarySchema,
  client: clientSummarySchema,
  primaryDiagnostic: Type.String(),
  clinicalGoals: Type.String(),
  contraindications: Type.Union([Type.String(), Type.Null()]),
  status: planStatusSchema,
  cancellationReason: Type.Union([planCancellationReasonSchema, Type.Null()]),
  cancellationNote: Type.Union([Type.String(), Type.Null()]),
  startDate: Type.String({ format: "date-time" }),
  endDate: Type.Union([Type.String({ format: "date-time" }), Type.Null()]),
  items: Type.Array(treatmentPlanItemResponse),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
});

const treatmentPlanAdminSummaryResponse = Type.Object({
  id: Type.Integer(),
  therapist: therapistSummarySchema,
  client: clientSummarySchema,
  status: planStatusSchema,
  startDate: Type.String({ format: "date-time" }),
  endDate: Type.Union([Type.String({ format: "date-time" }), Type.Null()]),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
});

export const treatmentPlanAdminListResponse = Type.Object({
  data: Type.Array(treatmentPlanAdminSummaryResponse),
  pagination: Type.Object(paginationMeta),
});

export const updateTreatmentPlanAdminBody = Type.Object(
  {
    therapistId: Type.Optional(Type.Integer({ minimum: 1 })),
    startDate: Type.Optional(Type.String({ format: "date-time" })),
    endDate: Type.Optional(
      Type.Union([Type.String({ format: "date-time" }), Type.Null()]),
    ),
  },
  { additionalProperties: false },
);

export const listTreatmentPlansQuery = Type.Object(
  {
    page: Type.Optional(Type.Integer({ minimum: 1, default: 1 })),
    limit: Type.Optional(
      Type.Integer({ minimum: 1, maximum: 100, default: 20 }),
    ),
    status: Type.Optional(planStatusSchema),
    clientId: Type.Optional(Type.Integer({ minimum: 1 })),
    therapistId: Type.Optional(Type.Integer({ minimum: 1 })),
    sortBy: planSortBySchema,
    sortOrder: sortOrderSchema,
  },
  { additionalProperties: false },
);

export const listTreatmentPlansSchema = {
  tags: ["Treatment Plans"],
  summary: "List all treatment plans",
  querystring: listTreatmentPlansQuery,
  response: {
    200: treatmentPlanAdminListResponse,
    400: validationErrorResponse,
    401: errorResponse,
    403: errorResponse,
  },
};

export const findTreatmentPlanSchema = {
  tags: ["Treatment Plans"],
  summary: "Get a treatment plan by ID",
  params: paramId,
  response: {
    200: treatmentPlanAdminResponse,
    400: validationErrorResponse,
    401: errorResponse,
    403: errorResponse,
    404: errorResponse,
  },
};

export const updateTreatmentPlanSchema = {
  tags: ["Treatment Plans"],
  summary: "Update a treatment plan",
  params: paramId,
  body: updateTreatmentPlanAdminBody,
  response: {
    200: treatmentPlanAdminResponse,
    400: validationErrorResponse,
    401: errorResponse,
    403: errorResponse,
    404: errorResponse,
  },
};

export const updateTreatmentPlanStatusAdminBody = planCancelledStatusSchema;

export const updateTreatmentPlanStatusAdminSchema = {
  tags: ["Treatment Plans"],
  summary: "Cancel a treatment plan",
  params: paramId,
  body: updateTreatmentPlanStatusAdminBody,
  response: {
    200: treatmentPlanAdminResponse,
    400: validationErrorResponse,
    401: errorResponse,
    403: errorResponse,
    404: errorResponse,
    422: errorResponse,
  },
};

export type UpdateTreatmentPlanAdminBody = Static<
  typeof updateTreatmentPlanAdminBody
>;
export type UpdateTreatmentPlanStatusAdminBody = Static<
  typeof updateTreatmentPlanStatusAdminBody
>;
export type ListTreatmentPlansQuery = Static<typeof listTreatmentPlansQuery>;
