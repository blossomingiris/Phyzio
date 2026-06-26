// TODO: this controller requires auth middleware to extract the therapist ID from the JWT.
// Wire up auth before registering this controller in routes.plugin.ts.

import { type ParamId } from "#app/modules/general/dto/index.ts";
import type { FastifyInstance } from "fastify";
import {
  findMyClientSchema,
  listMyClientsSchema,
  updateMyClientSchema,
  type ListMyClientsQuery,
  type UpdateMyClientBody,
} from "./clients.resource.dto.ts";
import { ClientsService } from "./clients.service.ts";

export default async function clientsResourceController(app: FastifyInstance) {
  const service = new ClientsService(app.drizzle);

  app.get<{ Querystring: ListMyClientsQuery }>(
    "/",
    { schema: listMyClientsSchema },
    async (req) => {
      // TODO: replace with req.user.therapistId once auth is wired up
      const therapistId: number = (req as any).user?.therapistId;
      const { page, limit, search, sortBy, sortOrder } = req.query;
      return service.all({ therapistId, search }, { page, limit }, { sortBy, sortOrder });
    },
  );

  app.get<{ Params: ParamId }>(
    "/:id",
    { schema: findMyClientSchema },
    async (req) => {
      // TODO: replace with req.user.therapistId once auth is wired up
      const therapistId: number = (req as any).user?.therapistId;
      return service.findOrFail(req.params.id, { therapistId });
    },
  );

  app.patch<{ Params: ParamId; Body: UpdateMyClientBody }>(
    "/:id",
    { schema: updateMyClientSchema },
    async (req) => {
      // TODO: replace with req.user.therapistId once auth is wired up
      const therapistId: number = (req as any).user?.therapistId;
      await service.findOrFail(req.params.id, { therapistId });
      return service.update(req.params.id, req.body);
    },
  );
}
