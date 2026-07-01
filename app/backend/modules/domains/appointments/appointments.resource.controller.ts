import { type ParamId } from "#app/modules/general/dto/index.ts";
import { authOnly } from "#app/modules/general/auth/authOnly.ts";
import type { FastifyInstance } from "fastify";
import {
  findMyAppointmentSchema,
  listMyAppointmentsSchema,
  updateMyAppointmentStatusSchema,
  type ListMyAppointmentsQuery,
  type UpdateMyAppointmentStatusBody,
} from "./appointments.resource.dto.ts";
import { AppointmentsService } from "./appointments.service.ts";

export default async function appointmentsResourceController(app: FastifyInstance) {
  const service = new AppointmentsService(app.drizzle);

  app.addHook("preHandler", authOnly);

  app.get<{ Querystring: ListMyAppointmentsQuery }>(
    "/",
    { schema: listMyAppointmentsSchema },
    async (req) => {
      const { page, limit, status, clientId, dateFrom, dateTo, sortBy, sortOrder } = req.query;
      return service.all(
        { therapistId: req.user.id, status, clientId, dateFrom, dateTo },
        { page, limit },
        { sortBy, sortOrder },
      );
    },
  );

  app.get<{ Params: ParamId }>(
    "/:id",
    { schema: findMyAppointmentSchema },
    async (req) => {
      return service.findOrFail(req.params.id, { therapistId: req.user.id });
    },
  );

  app.patch<{ Params: ParamId; Body: UpdateMyAppointmentStatusBody }>(
    "/:id/status",
    { schema: updateMyAppointmentStatusSchema },
    async (req) => {
      await service.findOrFail(req.params.id, { therapistId: req.user.id });
      return service.updateStatus(req.params.id, req.body, { therapistId: req.user.id });
    },
  );
}
