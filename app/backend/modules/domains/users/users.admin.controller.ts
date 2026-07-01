import { UsersService } from "#app/modules/domains/users/users.admin.service.ts";
import {
  createUserSchema,
  findUserSchema,
  listUsersSchema,
  updateRoleSchema,
  updateUserSchema,
  type CreateUserBody,
  type ListUsersQuery,
  type UpdateRoleBody,
  type UpdateUserBody,
} from "#app/modules/domains/users/users.admin.dto.ts";
import { type ParamId } from "#app/modules/general/dto/index.ts";
import { authOnly } from "#app/modules/general/auth/authOnly.ts";
import type { FastifyInstance } from "fastify";

export default async function usersAdminController(app: FastifyInstance) {
  const service = new UsersService(app.drizzle);

  app.addHook("preHandler", authOnly);

  app.get<{ Querystring: ListUsersQuery }>(
    "/",
    { schema: listUsersSchema },
    async (req) => {
      const { page, limit, search, role, sortBy, sortOrder } = req.query;
      return service.all(
        { search, role },
        { page, limit },
        { sortBy, sortOrder },
      );
    },
  );

  app.get<{ Params: ParamId }>(
    "/:id",
    { schema: findUserSchema },
    async (req) => {
      return service.findOrFail(req.params.id);
    },
  );

  app.post<{ Body: CreateUserBody }>(
    "/",
    { schema: createUserSchema },
    async (req, reply) => {
      const user = await service.create(req.body);
      return reply.code(201).send(user);
    },
  );

  app.patch<{ Params: ParamId; Body: UpdateUserBody }>(
    "/:id",
    { schema: updateUserSchema },
    async (req) => {
      await service.findOrFail(req.params.id);
      return service.update(req.params.id, req.body);
    },
  );

  app.patch<{ Params: ParamId; Body: UpdateRoleBody }>(
    "/:id/role",
    { schema: updateRoleSchema },
    async (req) => {
      await service.findOrFail(req.params.id);
      return service.updateRole(req.params.id, req.body.role);
    },
  );
}
