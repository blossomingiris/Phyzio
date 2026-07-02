import type { ParamId } from "#app/modules/general/dto/index.ts";
import { adminOnly } from "#app/modules/general/auth/requireRole.ts";
import type { FastifyInstance } from "fastify";
import {
  createTreatmentSchema,
  findTreatmentSchema,
  listTreatmentsSchema,
  updateTreatmentSchema,
  type CreateTreatmentBody,
  type ListTreatmentsQuery,
  type UpdateTreatmentBody,
} from "./treatments.admin.dto.ts";
import { TreatmentsService } from "./treatments.service.ts";

export default async function treatmentsAdminController(app: FastifyInstance) {
  const service = new TreatmentsService(app.drizzle);

  app.addHook("preHandler", adminOnly);

  app.get<{ Querystring: ListTreatmentsQuery }>(
    "/",
    { schema: listTreatmentsSchema },
    async (req) => {
      const { page, limit, category, isActive, sortBy, sortOrder } = req.query;
      return service.all({ category, isActive }, { page, limit }, { sortBy, sortOrder });
    },
  );

  app.get<{ Params: ParamId }>(
    "/:id",
    { schema: findTreatmentSchema },
    async (req) => {
      return service.findOrFail(req.params.id);
    },
  );

  app.post<{ Body: CreateTreatmentBody }>(
    "/",
    { schema: createTreatmentSchema },
    async (req, reply) => {
      const treatment = await service.create(req.body);
      return reply.code(201).send(treatment);
    },
  );

  app.patch<{ Params: ParamId; Body: UpdateTreatmentBody }>(
    "/:id",
    { schema: updateTreatmentSchema },
    async (req) => {
      return service.update(req.params.id, req.body);
    },
  );
}
