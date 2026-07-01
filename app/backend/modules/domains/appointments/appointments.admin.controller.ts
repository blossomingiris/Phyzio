import { type ParamId } from "#app/modules/general/dto/index.ts";
import { TreatmentPlansService } from "#app/modules/domains/treatment-plans/treatment-plans.resource.service.ts";
import { authOnly } from "#app/modules/general/auth/authOnly.ts";
import type { FastifyInstance } from "fastify";
import {
  createAppointmentSchema,
  deleteAppointmentSchema,
  findAppointmentSchema,
  listAppointmentsSchema,
  updateAppointmentSchema,
  updateAppointmentStatusSchema,
  type CreateAppointmentBody,
  type ListAppointmentsQuery,
  type UpdateAppointmentBody,
  type UpdateAppointmentStatusBody,
} from "./appointments.admin.dto.ts";
import { AppointmentsService } from "./appointments.service.ts";

export default async function appointmentsAdminController(app: FastifyInstance) {
  const service = new AppointmentsService(app.drizzle);
  const planService = new TreatmentPlansService(app.drizzle);

  app.addHook("preHandler", authOnly);

  app.get<{ Querystring: ListAppointmentsQuery }>(
    "/",
    { schema: listAppointmentsSchema },
    async (req) => {
      const { page, limit, status, therapistId, clientId, dateFrom, dateTo, sortBy, sortOrder } =
        req.query;
      return service.all(
        { status, therapistId, clientId, dateFrom, dateTo },
        { page, limit },
        { sortBy, sortOrder },
      );
    },
  );

  app.get<{ Params: ParamId }>(
    "/:id",
    { schema: findAppointmentSchema },
    async (req) => {
      return service.findOrFail(req.params.id);
    },
  );

  app.post<{ Body: CreateAppointmentBody }>(
    "/",
    { schema: createAppointmentSchema },
    async (req, reply) => {
      const appointment = await service.create(req.body);
      return reply.code(201).send(appointment);
    },
  );

  app.patch<{ Params: ParamId; Body: UpdateAppointmentBody }>(
    "/:id",
    { schema: updateAppointmentSchema },
    async (req) => {
      await service.findOrFail(req.params.id);
      return service.update(req.params.id, req.body);
    },
  );

  app.patch<{ Params: ParamId; Body: UpdateAppointmentStatusBody }>(
    "/:id/status",
    { schema: updateAppointmentStatusSchema },
    async (req) => {
      await service.findOrFail(req.params.id);
      const appointment = await service.updateStatus(req.params.id, req.body);

      if (req.body.status === "completed" && appointment.treatmentPlanId !== null) {
        const planId = appointment.treatmentPlanId;
        await planService.tryAdvanceToInProgress(planId);
        if (req.body.treatmentPlanItemId !== undefined) {
          await planService.creditItem(planId, req.body.treatmentPlanItemId);
        }
      }

      return appointment;
    },
  );

  app.delete<{ Params: ParamId }>(
    "/:id",
    { schema: deleteAppointmentSchema },
    async (req) => {
      await service.findOrFail(req.params.id);
      await service.destroy(req.params.id);
      return { success: true };
    },
  );
}
