import authController from "#app/modules/domains/auth/auth.controller.ts";
import appointmentsAdminController from "#app/modules/domains/appointments/appointments.admin.controller.ts";
import treatmentsAdminController from "#app/modules/domains/treatments/treatments.admin.controller.ts";
import appointmentsResourceController from "#app/modules/domains/appointments/appointments.resource.controller.ts";
import clientsAdminController from "#app/modules/domains/clients/clients.admin.controller.ts";
import clientsResourceController from "#app/modules/domains/clients/clients.resource.controller.ts";
import therapistsAdminController from "#app/modules/domains/users/therapists.admin.controller.ts";
import usersAdminController from "#app/modules/domains/users/users.admin.controller.ts";
import usersResourceController from "#app/modules/domains/users/users.resource.controller.ts";
import treatmentPlansAdminController from "#app/modules/domains/treatment-plans/treatment-plans.admin.controller.ts";
import treatmentPlansResourceController from "#app/modules/domains/treatment-plans/treatment-plans.resource.controller.ts";
import type { FastifyInstance } from "fastify";

export default async function routes(app: FastifyInstance) {
  app.register(authController, { prefix: "/auth" });
  app.register(usersAdminController, { prefix: "/users" });
  app.register(therapistsAdminController, { prefix: "/therapists" });
  app.register(clientsAdminController, { prefix: "/clients" });
  app.register(appointmentsAdminController, { prefix: "/appointments" });
  app.register(treatmentsAdminController, { prefix: "/treatments" });
  app.register(treatmentPlansAdminController, { prefix: "/treatment-plans" });
  app.register(usersResourceController, { prefix: "/me" });
  app.register(clientsResourceController, { prefix: "/me/clients" });
  app.register(appointmentsResourceController, { prefix: "/me/appointments" });
  app.register(treatmentPlansResourceController, { prefix: "/me/treatment-plans" });
}
