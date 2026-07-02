import type { ParamId } from "#app/modules/general/dto/index.ts";
import { adminOnly } from "#app/modules/general/auth/requireRole.ts";
import type { FastifyInstance } from "fastify";
import {
  findTreatmentPlanSchema,
  listTreatmentPlansSchema,
  updateTreatmentPlanSchema,
  updateTreatmentPlanStatusAdminSchema,
  type ListTreatmentPlansQuery,
  type UpdateTreatmentPlanAdminBody,
  type UpdateTreatmentPlanStatusAdminBody,
} from "./treatment-plans.admin.dto.ts";
import { TreatmentPlansAdminService } from "./treatment-plans.admin.service.ts";
import { TreatmentPlansService } from "./treatment-plans.resource.service.ts";

export default async function treatmentPlansAdminController(app: FastifyInstance) {
  const service = new TreatmentPlansService(app.drizzle);
  const adminService = new TreatmentPlansAdminService(app.drizzle, service);

  app.addHook("preHandler", adminOnly);

  app.get<{ Querystring: ListTreatmentPlansQuery }>(
    "/",
    { schema: listTreatmentPlansSchema },
    async (req) => {
      const { page, limit, status, clientId, therapistId, sortBy, sortOrder } = req.query;
      return service.all({ status, clientId, therapistId }, { page, limit }, { sortBy, sortOrder });
    },
  );

  app.get<{ Params: ParamId }>(
    "/:id",
    { schema: findTreatmentPlanSchema },
    async (req) => {
      return service.findOrFail(req.params.id);
    },
  );

  app.patch<{ Params: ParamId; Body: UpdateTreatmentPlanAdminBody }>(
    "/:id",
    { schema: updateTreatmentPlanSchema },
    async (req) => {
      await service.findOrFail(req.params.id);
      return adminService.update(req.params.id, req.body);
    },
  );

  app.patch<{ Params: ParamId; Body: UpdateTreatmentPlanStatusAdminBody }>(
    "/:id/status",
    { schema: updateTreatmentPlanStatusAdminSchema },
    async (req) => {
      await service.findOrFail(req.params.id);
      return adminService.cancel(req.params.id, req.body);
    },
  );
}
