import type { ParamId } from "#app/modules/general/dto/index.ts";
import type { FastifyInstance } from "fastify";
import {
  findTreatmentPlanSchema,
  listTreatmentPlansSchema,
  updateTreatmentPlanSchema,
  type ListTreatmentPlansQuery,
  type UpdateTreatmentPlanAdminBody,
} from "./treatment-plans.admin.dto.ts";
import { TreatmentPlansService } from "./treatment-plans.service.ts";

export default async function treatmentPlansAdminController(app: FastifyInstance) {
  const service = new TreatmentPlansService(app.drizzle);

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
      return service.adminUpdate(req.params.id, req.body);
    },
  );
}
