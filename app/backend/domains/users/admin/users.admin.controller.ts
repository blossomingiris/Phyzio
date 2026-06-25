import { ParamId } from "#app/domains/shared/dto/index.ts";
import {
  adminCreateUserSchema,
  adminFindUserSchema,
  adminListUsersSchema,
  adminUpdateRoleSchema,
  adminUpdateUserSchema,
  type AdminListUsersQuery,
  type AdminCreateUserBody,
  type AdminUpdateUserBody,
  type AdminUpdateRoleBody,
} from "#app/domains/users/admin/users.admin.dto.ts";
import { UsersService } from "#app/domains/users/admin/users.admin.service.ts";
import type { FastifyInstance } from "fastify";

export default async function usersAdminController(app: FastifyInstance) {
  const service = new UsersService(app.drizzle);

  app.get<{ Querystring: AdminListUsersQuery }>(
    "/",
    { schema: adminListUsersSchema },
    async (req) => {
      const { page, limit, name, role, speciality } = req.query;
      return service.all({ name, role, speciality }, { page, limit });
    },
  );

  app.get<{ Params: ParamId }>(
    "/:id",
    { schema: adminFindUserSchema },
    async (req) => {
      return service.findOrFail(req.params.id);
    },
  );

  app.post<{ Body: AdminCreateUserBody }>(
    "/",
    { schema: adminCreateUserSchema },
    async (req, reply) => {
      const user = await service.create(req.body);
      return reply.code(201).send(user);
    },
  );

  app.patch<{ Params: ParamId; Body: AdminUpdateUserBody }>(
    "/:id",
    { schema: adminUpdateUserSchema },
    async (req) => {
      return service.update(req.params.id, req.body);
    },
  );

  app.patch<{ Params: ParamId; Body: AdminUpdateRoleBody }>(
    "/:id/role",
    { schema: adminUpdateRoleSchema },
    async (req) => {
      return service.updateRole(req.params.id, req.body.role);
    },
  );
}
