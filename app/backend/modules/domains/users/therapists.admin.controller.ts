import { TherapistsService } from "#app/modules/domains/users/therapists.admin.service.ts";
import {
  createTherapistSchema,
  deleteTherapistSchema,
  findTherapistSchema,
  listTherapistsSchema,
  updateTherapistSchema,
  type CreateTherapistBody,
  type FindTherapistQuery,
  type ListTherapistsQuery,
  type UpdateTherapistBody,
} from "#app/modules/domains/users/therapists.admin.dto.ts";
import { type ParamId } from "#app/modules/general/dto/index.ts";
import { adminOnly } from "#app/modules/general/auth/requireRole.ts";
import type { FastifyInstance } from "fastify";

export default async function therapistsAdminController(app: FastifyInstance) {
  const service = new TherapistsService(app.drizzle);

  app.addHook("preHandler", adminOnly);

  app.get<{ Querystring: ListTherapistsQuery }>(
    "/",
    { schema: listTherapistsSchema },
    async (req) => {
      const {
        page,
        limit,
        search,
        speciality,
        isActive,
        deleted,
        sortBy,
        sortOrder,
      } = req.query;
      return service.all(
        { search, speciality, isActive, deleted },
        { page, limit },
        { sortBy, sortOrder },
      );
    },
  );

  app.get<{ Params: ParamId; Querystring: FindTherapistQuery }>(
    "/:id",
    { schema: findTherapistSchema },
    async (req) => {
      return service.findOrFail(req.params.id, { deleted: req.query.deleted });
    },
  );

  app.post<{ Body: CreateTherapistBody }>(
    "/",
    { schema: createTherapistSchema },
    async (req, reply) => {
      const therapist = await service.create(req.body);
      return reply.code(201).send(therapist);
    },
  );

  app.patch<{ Params: ParamId; Body: UpdateTherapistBody }>(
    "/:id",
    { schema: updateTherapistSchema },
    async (req) => {
      await service.findOrFail(req.params.id);
      return service.update(req.params.id, req.body);
    },
  );

  app.delete<{ Params: ParamId }>(
    "/:id",
    { schema: deleteTherapistSchema },
    async (req) => {
      await service.findOrFail(req.params.id);
      await service.destroy(req.params.id);
      return { success: true };
    },
  );
}
