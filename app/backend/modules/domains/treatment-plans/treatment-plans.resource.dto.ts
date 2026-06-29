import {
  clientSummarySchema,
  paramId,
  paginationMeta,
  sortOrderSchema,
} from "#app/modules/general/dto/index.ts";
import {
  planCancellationReasonSchema,
  planSortBySchema,
  planStatusSchema,
  treatmentPlanItemResponse,
} from "./treatment-plans.shared.dto.ts";
import Type, { type Static } from "typebox";

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

// ─── Request bodies ───────────────────────────────────────────────────────────

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
export type CreateTreatmentPlanBody = Static<typeof createTreatmentPlanBody>;

export const updateTreatmentPlanBody = Type.Object(
  {
    primaryDiagnostic: Type.Optional(Type.String({ minLength: 1 })),
    clinicalGoals: Type.Optional(Type.String({ minLength: 1 })),
    contraindications: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    status: Type.Optional(planStatusSchema),
    cancellationReason: Type.Optional(planCancellationReasonSchema),
    cancellationNote: Type.Optional(Type.String()),
    startDate: Type.Optional(Type.String({ format: "date-time" })),
    endDate: Type.Optional(
      Type.Union([Type.String({ format: "date-time" }), Type.Null()]),
    ),
  },
  { additionalProperties: false },
);
export type UpdateTreatmentPlanBody = Static<typeof updateTreatmentPlanBody>;

export const addTreatmentPlanItemBody = Type.Object(
  { treatmentId: Type.Integer({ minimum: 1 }) },
  { additionalProperties: false },
);
export type AddTreatmentPlanItemBody = Static<typeof addTreatmentPlanItemBody>;

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
export type ListTreatmentPlansQuery = Static<typeof listTreatmentPlansQuery>;

const treatmentPlanItemParams = Type.Object(
  {
    id: Type.Integer({ minimum: 1 }),
    itemId: Type.Integer({ minimum: 1 }),
  },
  { additionalProperties: false },
);

export const listTreatmentPlansSchema = {
  tags: ["Treatment Plans"],
  summary: "List my treatment plans",
  querystring: listTreatmentPlansQuery,
  response: { 200: treatmentPlanResourceListResponse },
};

export const findTreatmentPlanSchema = {
  tags: ["Treatment Plans"],
  summary: "Get a treatment plan by ID",
  params: paramId,
  response: { 200: treatmentPlanResourceResponse },
};

export const createTreatmentPlanSchema = {
  tags: ["Treatment Plans"],
  summary: "Create a treatment plan",
  body: createTreatmentPlanBody,
  response: { 201: treatmentPlanResourceResponse },
};

export const updateTreatmentPlanSchema = {
  tags: ["Treatment Plans"],
  summary: "Update a treatment plan",
  params: paramId,
  body: updateTreatmentPlanBody,
  response: { 200: treatmentPlanResourceResponse },
};

export const addTreatmentPlanItemSchema = {
  tags: ["Treatment Plans"],
  summary: "Add a treatment to a plan",
  params: paramId,
  body: addTreatmentPlanItemBody,
  response: { 201: treatmentPlanResourceResponse },
};

export const deleteTreatmentPlanItemSchema = {
  tags: ["Treatment Plans"],
  summary: "Remove a treatment from a plan",
  params: treatmentPlanItemParams,
  response: { 200: treatmentPlanResourceResponse },
};
