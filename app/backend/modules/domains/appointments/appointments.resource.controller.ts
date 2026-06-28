// TODO: this controller requires auth middleware to extract the therapist ID from the JWT.
// Wire up auth before registering this controller in routes.plugin.ts.

import { type ParamId } from "#app/modules/general/dto/index.ts";
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

  app.get<{ Querystring: ListMyAppointmentsQuery }>(
    "/",
    { schema: listMyAppointmentsSchema },
    async (req) => {
      // TODO: replace with req.user.therapistId once auth is wired up
      const therapistId: number = (req as any).user?.therapistId;
      const { page, limit, status, clientId, dateFrom, dateTo, sortBy, sortOrder } = req.query;
      return service.all(
        { therapistId, status, clientId, dateFrom, dateTo },
        { page, limit },
        { sortBy, sortOrder },
      );
    },
  );

  app.get<{ Params: ParamId }>(
    "/:id",
    { schema: findMyAppointmentSchema },
    async (req) => {
      // TODO: replace with req.user.therapistId once auth is wired up
      const therapistId: number = (req as any).user?.therapistId;
      return service.findOrFail(req.params.id, { therapistId });
    },
  );

  app.patch<{ Params: ParamId; Body: UpdateMyAppointmentStatusBody }>(
    "/:id/status",
    { schema: updateMyAppointmentStatusSchema },
    async (req) => {
      // TODO: replace with req.user.therapistId once auth is wired up
      const therapistId: number = (req as any).user?.therapistId;
      await service.findOrFail(req.params.id, { therapistId });
      return service.updateStatus(req.params.id, req.body, { therapistId });
    },
  );
}
