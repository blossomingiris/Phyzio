import {
  errorResponse,
  paramId,
  paginationMetaResponse,
  sortOrderSchema,
  therapistSummarySchema,
  fieldErrorResponse,
} from "#app/modules/general/dto/index.ts";
import { discriminatedUnion } from "#app/modules/general/dto/typebox.ts";
import Type, { type Static } from "typebox";

import {
  appointmentBaseBody,
  appointmentBaseResponse,
  appointmentSortBySchema,
  appointmentStatusSchema,
  cancelledStatusSchema,
  completedStatusSchema,
  nonCancelledStatusSchema,
} from "#app/modules/domains/appointments/appointments.shared.dto.ts";

export const appointmentResponse = Type.Object({
  ...appointmentBaseResponse.properties,
  therapist: Type.Union([therapistSummarySchema, Type.Null()]),
});

export const appointmentListResponse = Type.Object({
  data: Type.Array(appointmentResponse),
  pagination: paginationMetaResponse,
});

export const listAppointmentsQuery = Type.Object(
  {
    page: Type.Optional(Type.Integer({ minimum: 1, default: 1 })),
    limit: Type.Optional(
      Type.Integer({ minimum: 1, maximum: 100, default: 20 }),
    ),
    status: Type.Optional(appointmentStatusSchema),
    therapistId: Type.Optional(Type.Integer({ minimum: 1 })),
    clientId: Type.Optional(Type.Integer({ minimum: 1 })),
    dateFrom: Type.Optional(
      Type.String({
        format: "date-time",
        description: "Filter appointments with startedAt ≥ dateFrom",
      }),
    ),
    dateTo: Type.Optional(
      Type.String({
        format: "date-time",
        description: "Filter appointments with startedAt ≤ dateTo",
      }),
    ),
    sortBy: appointmentSortBySchema,
    sortOrder: sortOrderSchema,
  },
  { additionalProperties: false },
);

export const createAppointmentBody = Type.Object(
  { ...appointmentBaseBody.properties },
  { additionalProperties: false },
);

export const updateAppointmentBody = Type.Partial(createAppointmentBody);

export const updateAppointmentStatusBody = discriminatedUnion("status", [
  cancelledStatusSchema,
  completedStatusSchema,
  nonCancelledStatusSchema,
]);

const tag = { tags: ["Admin / Appointments"] as const };

export const listAppointmentsSchema = {
  ...tag,
  summary: "List all appointments",
  querystring: listAppointmentsQuery,
  response: {
    200: appointmentListResponse,
    400: fieldErrorResponse,
    401: errorResponse,
    403: errorResponse,
  },
};

export const findAppointmentSchema = {
  ...tag,
  summary: "Get an appointment by ID",
  params: paramId,
  response: {
    200: appointmentResponse,
    400: fieldErrorResponse,
    401: errorResponse,
    403: errorResponse,
    404: errorResponse,
  },
};

export const createAppointmentSchema = {
  ...tag,
  summary: "Create an appointment",
  body: createAppointmentBody,
  response: {
    201: appointmentResponse,
    400: fieldErrorResponse,
    401: errorResponse,
    403: errorResponse,
    409: errorResponse,
  },
};

export const updateAppointmentSchema = {
  ...tag,
  summary: "Update an appointment",
  params: paramId,
  body: updateAppointmentBody,
  response: {
    200: appointmentResponse,
    400: fieldErrorResponse,
    401: errorResponse,
    403: errorResponse,
    404: errorResponse,
    409: errorResponse,
  },
};

export const deleteAppointmentSchema = {
  ...tag,
  summary: "Delete an appointment",
  params: paramId,
  response: {
    200: Type.Object({ success: Type.Boolean() }),
    400: fieldErrorResponse,
    401: errorResponse,
    403: errorResponse,
    404: errorResponse,
  },
};

export const updateAppointmentStatusSchema = {
  ...tag,
  summary: "Change appointment status",
  params: paramId,
  body: updateAppointmentStatusBody,
  response: {
    200: appointmentResponse,
    400: fieldErrorResponse,
    401: errorResponse,
    403: errorResponse,
    404: errorResponse,
    422: fieldErrorResponse,
  },
};

export type ListAppointmentsQuery = Static<typeof listAppointmentsQuery>;
export type CreateAppointmentBody = Static<typeof createAppointmentBody>;
export type UpdateAppointmentBody = Static<typeof updateAppointmentBody>;
export type UpdateAppointmentStatusBody = Static<typeof updateAppointmentStatusBody>;
