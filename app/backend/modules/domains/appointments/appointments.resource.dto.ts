import {
  errorResponse,
  paramId,
  paginationMetaResponse,
  sortOrderSchema,
  fieldErrorResponse,
} from "#app/modules/general/dto/index.ts";
import { discriminatedUnion } from "#app/modules/general/dto/typebox.ts";
import Type, { type Static } from "typebox";

import {
  appointmentBaseResponse,
  appointmentSortBySchema,
  appointmentStatusSchema,
  cancelledStatusSchema,
} from "#app/modules/domains/appointments/appointments.shared.dto.ts";

export const myAppointmentListResponse = Type.Object({
  data: Type.Array(appointmentBaseResponse),
  pagination: paginationMetaResponse,
});

export const listMyAppointmentsQuery = Type.Object(
  {
    page: Type.Optional(Type.Integer({ minimum: 1, default: 1 })),
    limit: Type.Optional(
      Type.Integer({ minimum: 1, maximum: 100, default: 20 }),
    ),
    status: Type.Optional(appointmentStatusSchema),
    clientId: Type.Optional(Type.Integer({ minimum: 1 })),
    dateFrom: Type.Optional(Type.String({ format: "date-time" })),
    dateTo: Type.Optional(Type.String({ format: "date-time" })),
    sortBy: appointmentSortBySchema,
    sortOrder: sortOrderSchema,
  },
  { additionalProperties: false },
);

const myConfirmedStatusSchema = Type.Object(
  { status: Type.Literal("confirmed") },
  { additionalProperties: false },
);

export const updateMyAppointmentStatusBody = discriminatedUnion("status", [
  myConfirmedStatusSchema,
  cancelledStatusSchema,
]);

const tag = { tags: ["Me / Appointments"] as const };

export const listMyAppointmentsSchema = {
  ...tag,
  summary: "List my appointments",
  querystring: listMyAppointmentsQuery,
  response: {
    200: myAppointmentListResponse,
    400: fieldErrorResponse,
    401: errorResponse,
  },
};

export const findMyAppointmentSchema = {
  ...tag,
  summary: "Get my appointment by ID",
  params: paramId,
  response: {
    200: appointmentBaseResponse,
    400: fieldErrorResponse,
    401: errorResponse,
    404: errorResponse,
  },
};

export const updateMyAppointmentStatusSchema = {
  ...tag,
  summary: "Change status of my appointment",
  params: paramId,
  body: updateMyAppointmentStatusBody,
  response: {
    200: appointmentBaseResponse,
    400: fieldErrorResponse,
    401: errorResponse,
    404: errorResponse,
    422: fieldErrorResponse,
  },
};

export type ListMyAppointmentsQuery = Static<typeof listMyAppointmentsQuery>;
export type UpdateMyAppointmentStatusBody = Static<typeof updateMyAppointmentStatusBody>;
