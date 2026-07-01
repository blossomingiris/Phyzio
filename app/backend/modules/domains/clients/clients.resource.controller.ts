import { type ParamId } from "#app/modules/general/dto/index.ts";
import { authOnly } from "#app/modules/general/auth/authOnly.ts";
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

  app.addHook("preHandler", authOnly);

  app.get<{ Querystring: ListMyClientsQuery }>(
    "/",
    { schema: listMyClientsSchema },
    async (req) => {
      const { page, limit, search, sortBy, sortOrder } = req.query;
      return service.all({ therapistId: req.user.id, search }, { page, limit }, { sortBy, sortOrder });
    },
  );

  app.get<{ Params: ParamId }>(
    "/:id",
    { schema: findMyClientSchema },
    async (req) => {
      return service.findOrFail(req.params.id, { therapistId: req.user.id });
    },
  );

  app.patch<{ Params: ParamId; Body: UpdateMyClientBody }>(
    "/:id",
    { schema: updateMyClientSchema },
    async (req) => {
      await service.findOrFail(req.params.id, { therapistId: req.user.id });
      return service.update(req.params.id, req.body);
    },
  );
}
