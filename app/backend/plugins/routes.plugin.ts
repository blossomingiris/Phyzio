import usersAdminController from "#app/domains/users/admin/users.admin.controller.ts";
import usersTherapistController from "#app/domains/users/therapists/users.therapist.controller.ts";
import type { FastifyInstance } from "fastify";

export default async function routes(app: FastifyInstance) {
  app.register(usersAdminController, { prefix: "/users" });
  app.register(usersTherapistController, { prefix: "/therapists" });
}
