import { type ParamId } from "#app/modules/general/dto/index.ts";
import { adminOnly } from "#app/modules/general/auth/requireRole.ts";
import type { FastifyInstance } from "fastify";
import {
  createClientSchema,
  deleteClientSchema,
  findClientSchema,
  listClientsSchema,
  updateClientSchema,
  type CreateClientBody,
  type ListClientsQuery,
  type UpdateClientBody,
} from "./clients.admin.dto.ts";
import { ClientsService } from "./clients.service.ts";

export default async function clientsAdminController(app: FastifyInstance) {
  const service = new ClientsService(app.drizzle);

  app.addHook("preHandler", adminOnly);

  app.get<{ Querystring: ListClientsQuery }>(
    "/",
    { schema: listClientsSchema },
    async (req) => {
      const { page, limit, search, therapistId, sortBy, sortOrder } = req.query;
      return service.all({ search, therapistId }, { page, limit }, { sortBy, sortOrder });
    },
  );

  app.get<{ Params: ParamId }>(
    "/:id",
    { schema: findClientSchema },
    async (req) => {
      return service.findOrFail(req.params.id);
    },
  );

  app.post<{ Body: CreateClientBody }>(
    "/",
    { schema: createClientSchema },
    async (req, reply) => {
      const client = await service.create(req.body);
      return reply.code(201).send(client);
    },
  );

  app.patch<{ Params: ParamId; Body: UpdateClientBody }>(
    "/:id",
    { schema: updateClientSchema },
    async (req) => {
      await service.findOrFail(req.params.id);
      return service.update(req.params.id, req.body);
    },
  );

  app.delete<{ Params: ParamId }>(
    "/:id",
    { schema: deleteClientSchema },
    async (req) => {
      await service.findOrFail(req.params.id);
      await service.destroy(req.params.id);
      return { success: true };
    },
  );
}
