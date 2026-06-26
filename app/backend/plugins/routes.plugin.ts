import usersAdminController from "#app/modules/domains/users/admin/users.admin.controller.ts";
import usersTherapistController from "#app/modules/domains/users/therapists/therapists.admin.controller.ts";
import type { FastifyInstance } from "fastify";

export default async function routes(app: FastifyInstance) {
  app.register(usersAdminController, { prefix: "/users" });
  app.register(usersTherapistController, { prefix: "/therapists" });
}
