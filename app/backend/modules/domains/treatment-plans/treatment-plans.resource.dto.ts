import {
  clientSummarySchema,
  errorResponse,
  paginationMeta,
  paramId,
  sortOrderSchema,
  fieldErrorResponse,
} from "#app/modules/general/dto/index.ts";
import { discriminatedUnion } from "#app/modules/general/dto/typebox.ts";
import Type, { type Static } from "typebox";
import {
  planCancelledStatusSchema,
  planCancellationReasonSchema,
  planSortBySchema,
  planStatusSchema,
  treatmentPlanItemResponse,
} from "./treatment-plans.shared.dto.ts";

export const treatmentPlanResourceResponse = Type.Object({
  id: Type.Integer(),
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

const treatmentPlanResourceSummaryResponse = Type.Object({
  id: Type.Integer(),
  client: clientSummarySchema,
  status: planStatusSchema,
  startDate: Type.String({ format: "date-time" }),
  endDate: Type.Union([Type.String({ format: "date-time" }), Type.Null()]),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
});

export const treatmentPlanResourceListResponse = Type.Object({
  data: Type.Array(treatmentPlanResourceSummaryResponse),
  pagination: Type.Object(paginationMeta),
});

export const createTreatmentPlanBody = Type.Object(
  {
    clientId: Type.Integer({ minimum: 1 }),
    primaryDiagnostic: Type.String({ minLength: 1 }),
    clinicalGoals: Type.String({ minLength: 1 }),
    contraindications: Type.Optional(Type.String()),
    startDate: Type.String({ format: "date-time" }),
    endDate: Type.Optional(Type.String({ format: "date-time" })),
    items: Type.Array(
      Type.Object(
        { treatmentId: Type.Integer({ minimum: 1 }) },
        { additionalProperties: false },
      ),
      { minItems: 1 },
    ),
  },
  { additionalProperties: false },
);

export const updateTreatmentPlanBody = Type.Object(
  {
    primaryDiagnostic: Type.Optional(Type.String({ minLength: 1 })),
    clinicalGoals: Type.Optional(Type.String({ minLength: 1 })),
    contraindications: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    startDate: Type.Optional(Type.String({ format: "date-time" })),
    endDate: Type.Optional(
      Type.Union([Type.String({ format: "date-time" }), Type.Null()]),
    ),
  },
  { additionalProperties: false },
);

const pausedPlanStatusSchema = Type.Object(
  { status: Type.Literal("paused") },
  { additionalProperties: false },
);
const completedPlanStatusSchema = Type.Object(
  { status: Type.Literal("completed") },
  { additionalProperties: false },
);
const inProgressPlanStatusSchema = Type.Object(
  { status: Type.Literal("in_progress") },
  { additionalProperties: false },
);

export const updateTreatmentPlanStatusBody = discriminatedUnion("status", [
  planCancelledStatusSchema,
  pausedPlanStatusSchema,
  completedPlanStatusSchema,
  inProgressPlanStatusSchema,
]);

export const addTreatmentPlanItemBody = Type.Object(
  { treatmentId: Type.Integer({ minimum: 1 }) },
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
    sortBy: planSortBySchema,
    sortOrder: sortOrderSchema,
  },
  { additionalProperties: false },
);

const treatmentPlanItemParams = Type.Object(
  {
    id: Type.Integer({ minimum: 1 }),
    itemId: Type.Integer({ minimum: 1 }),
  },
  { additionalProperties: false },
);

export const listTreatmentPlansSchema = {
  tags: ["Me"],
  summary: "List my treatment plans",
  querystring: listTreatmentPlansQuery,
  response: {
    200: treatmentPlanResourceListResponse,
    400: fieldErrorResponse,
    401: errorResponse,
  },
};

export const findTreatmentPlanSchema = {
  tags: ["Me"],
  summary: "Get a treatment plan by ID",
  params: paramId,
  response: {
    200: treatmentPlanResourceResponse,
    400: fieldErrorResponse,
    401: errorResponse,
    404: errorResponse,
  },
};

export const createTreatmentPlanSchema = {
  tags: ["Me"],
  summary: "Create a treatment plan",
  body: createTreatmentPlanBody,
  response: {
    201: treatmentPlanResourceResponse,
    400: fieldErrorResponse,
    401: errorResponse,
    404: errorResponse,
    422: fieldErrorResponse,
  },
};

export const updateTreatmentPlanSchema = {
  tags: ["Me"],
  summary: "Update a treatment plan",
  params: paramId,
  body: updateTreatmentPlanBody,
  response: {
    200: treatmentPlanResourceResponse,
    400: fieldErrorResponse,
    401: errorResponse,
    404: errorResponse,
    422: fieldErrorResponse,
  },
};

export const updateTreatmentPlanStatusSchema = {
  tags: ["Me"],
  summary: "Update the status of a treatment plan",
  params: paramId,
  body: updateTreatmentPlanStatusBody,
  response: {
    200: treatmentPlanResourceResponse,
    400: fieldErrorResponse,
    401: errorResponse,
    404: errorResponse,
    422: fieldErrorResponse,
  },
};

export const addTreatmentPlanItemSchema = {
  tags: ["Me"],
  summary: "Add a treatment to a plan",
  params: paramId,
  body: addTreatmentPlanItemBody,
  response: {
    201: treatmentPlanResourceResponse,
    400: fieldErrorResponse,
    401: errorResponse,
    404: errorResponse,
    409: errorResponse,
    422: fieldErrorResponse,
  },
};

export const deleteTreatmentPlanItemSchema = {
  tags: ["Me"],
  summary: "Remove a treatment from a plan",
  params: treatmentPlanItemParams,
  response: {
    200: Type.Object({ success: Type.Boolean() }),
    400: fieldErrorResponse,
    401: errorResponse,
    404: errorResponse,
    422: fieldErrorResponse,
  },
};

export type CreateTreatmentPlanBody = Static<typeof createTreatmentPlanBody>;
export type ListTreatmentPlansQuery = Static<typeof listTreatmentPlansQuery>;
export type AddTreatmentPlanItemBody = Static<typeof addTreatmentPlanItemBody>;
export type UpdateTreatmentPlanBody = Static<typeof updateTreatmentPlanBody>;
export type UpdateTreatmentPlanStatusBody = Static<typeof updateTreatmentPlanStatusBody>;
