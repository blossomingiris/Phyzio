// TODO: this controller requires auth middleware to extract the therapist ID from the JWT.
// Wire up auth before registering this controller in routes.plugin.ts.

import type { ParamId } from "#app/modules/general/dto/index.ts";
import type { FastifyInstance } from "fastify";
import {
  addTreatmentPlanItemSchema,
  createTreatmentPlanSchema,
  deleteTreatmentPlanItemSchema,
  findTreatmentPlanSchema,
  listTreatmentPlansSchema,
  updateTreatmentPlanSchema,
  type AddTreatmentPlanItemBody,
  type CreateTreatmentPlanBody,
  type ListTreatmentPlansQuery,
  type UpdateTreatmentPlanBody,
} from "./treatment-plans.resource.dto.ts";
import { TreatmentPlansService } from "./treatment-plans.service.ts";

type ItemParams = { id: number; itemId: number };

export default async function treatmentPlansResourceController(app: FastifyInstance) {
  const service = new TreatmentPlansService(app.drizzle);

  app.get<{ Querystring: ListTreatmentPlansQuery }>(
    "/",
    { schema: listTreatmentPlansSchema },
    async (req) => {
      // TODO: replace with req.user.therapistId once auth is wired up
      const therapistId: number = (req as any).user?.therapistId;
      const { page, limit, status, clientId, sortBy, sortOrder } = req.query;
      return service.all({ therapistId, status, clientId }, { page, limit }, { sortBy, sortOrder });
    },
  );

  app.get<{ Params: ParamId }>(
    "/:id",
    { schema: findTreatmentPlanSchema },
    async (req) => {
      // TODO: replace with req.user.therapistId once auth is wired up
      const therapistId: number = (req as any).user?.therapistId;
      return service.findOrFail(req.params.id, { therapistId });
    },
  );

  app.post<{ Body: CreateTreatmentPlanBody }>(
    "/",
    { schema: createTreatmentPlanSchema },
    async (req, reply) => {
      // TODO: replace with req.user.therapistId once auth is wired up
      const therapistId: number = (req as any).user?.therapistId;
      const plan = await service.create(req.body, therapistId);
      return reply.code(201).send(plan);
    },
  );

  app.patch<{ Params: ParamId; Body: UpdateTreatmentPlanBody }>(
    "/:id",
    { schema: updateTreatmentPlanSchema },
    async (req) => {
      // TODO: replace with req.user.therapistId once auth is wired up
      const therapistId: number = (req as any).user?.therapistId;
      await service.findOrFail(req.params.id, { therapistId });
      return service.update(req.params.id, req.body);
    },
  );

  app.post<{ Params: ParamId; Body: AddTreatmentPlanItemBody }>(
    "/:id/items",
    { schema: addTreatmentPlanItemSchema },
    async (req, reply) => {
      // TODO: replace with req.user.therapistId once auth is wired up
      const therapistId: number = (req as any).user?.therapistId;
      await service.findOrFail(req.params.id, { therapistId });
      const plan = await service.addItem(req.params.id, req.body);
      return reply.code(201).send(plan);
    },
  );

  app.delete<{ Params: ItemParams }>(
    "/:id/items/:itemId",
    { schema: deleteTreatmentPlanItemSchema },
    async (req) => {
      // TODO: replace with req.user.therapistId once auth is wired up
      const therapistId: number = (req as any).user?.therapistId;
      await service.findOrFail(req.params.id, { therapistId });
      await service.removeItem(req.params.id, req.params.itemId);
      return { success: true };
    },
  );
}
