import { paramId, sortOrderSchema } from "#app/modules/general/dto/index.ts";
import Type, { type Static } from "typebox";

import {
  appointmentBaseBody,
  appointmentListResponse,
  appointmentResponse,
  appointmentSortBySchema,
  appointmentStatusSchema,
  cancelledTransitionSchema,
  nonCancelledTransitionSchema,
} from "#app/modules/domains/appointments/appointments.shared.dto.ts";

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

export const transitionAppointmentBody = Type.Union(
  [cancelledTransitionSchema, nonCancelledTransitionSchema],
  { discriminator: { propertyName: "status" } },
);

export const listAppointmentsSchema = {
  tags: ["Appointments"],
  summary: "List all appointments",
  querystring: listAppointmentsQuery,
  response: { 200: appointmentListResponse },
};

export const findAppointmentSchema = {
  tags: ["Appointments"],
  summary: "Get an appointment by ID",
  params: paramId,
  response: { 200: appointmentResponse },
};

export const createAppointmentSchema = {
  tags: ["Appointments"],
  summary: "Create an appointment",
  body: createAppointmentBody,
  response: { 201: appointmentResponse },
};

export const updateAppointmentSchema = {
  tags: ["Appointments"],
  summary: "Update an appointment",
  params: paramId,
  body: updateAppointmentBody,
  response: { 200: appointmentResponse },
};

export const deleteAppointmentSchema = {
  tags: ["Appointments"],
  summary: "Delete an appointment",
  params: paramId,
  response: { 200: Type.Object({ success: Type.Boolean() }) },
};

export const transitionAppointmentSchema = {
  tags: ["Appointments"],
  summary: "Change appointment status",
  params: paramId,
  body: transitionAppointmentBody,
  response: { 200: appointmentResponse },
};

export type ListAppointmentsQuery = Static<typeof listAppointmentsQuery>;
export type CreateAppointmentBody = Static<typeof createAppointmentBody>;
export type UpdateAppointmentBody = Static<typeof updateAppointmentBody>;
export type TransitionAppointmentBody = Static<typeof transitionAppointmentBody>;
