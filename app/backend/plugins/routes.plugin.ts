import clientsAdminController from "#app/modules/domains/clients/clients.admin.controller.ts";
import clientsResourceController from "#app/modules/domains/clients/clients.resource.controller.ts";
import usersTherapistController from "#app/modules/domains/users/therapists.admin.controller.ts";
import usersAdminController from "#app/modules/domains/users/users.admin.controller.ts";
import type { FastifyInstance } from "fastify";

export default async function routes(app: FastifyInstance) {
  app.register(usersAdminController, { prefix: "/users" });
  app.register(usersTherapistController, { prefix: "/therapists" });
  app.register(clientsAdminController, { prefix: "/clients" });
  app.register(clientsResourceController, { prefix: "/me/clients" });
}
