import { UsersService } from "#app/modules/domains/users/users.admin.service.ts";
import {
  createUserSchema,
  deleteUserSchema,
  findUserSchema,
  listUsersSchema,
  updateRoleSchema,
  updateUserSchema,
  type CreateUserBody,
  type FindUserQuery,
  type ListUsersQuery,
  type UpdateRoleBody,
  type UpdateUserBody,
} from "#app/modules/domains/users/users.admin.dto.ts";
import { type ParamId } from "#app/modules/general/dto/index.ts";
import { adminOnly } from "#app/modules/general/auth/requireRole.ts";
import type { FastifyInstance } from "fastify";

export default async function usersAdminController(app: FastifyInstance) {
  const service = new UsersService(app.drizzle);

  app.addHook("preHandler", adminOnly);

  app.get<{ Querystring: ListUsersQuery }>(
    "/",
    { schema: listUsersSchema },
    async (req) => {
      const { page, limit, search, role, deleted, sortBy, sortOrder } =
        req.query;
      return service.all(
        { search, role, status: deleted },
        { page, limit },
        { sortBy, sortOrder },
      );
    },
  );

  app.get<{ Params: ParamId; Querystring: FindUserQuery }>(
    "/:id",
    { schema: findUserSchema },
    async (req) => {
      return service.findOrFail(req.params.id, {
        status: req.query.deleted ? "all" : "active",
      });
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

  app.delete<{ Params: ParamId }>(
    "/:id",
    { schema: deleteUserSchema },
    async (req) => {
      await service.findOrFail(req.params.id);
      await service.destroy(req.params.id);
      return { success: true };
    },
  );
}
