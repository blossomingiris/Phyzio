import { TherapistsService } from "#app/modules/domains/users/therapists.admin.service.ts";
import {
  createTherapistSchema,
  deleteTherapistSchema,
  findTherapistSchema,
  listTherapistsSchema,
  updateTherapistSchema,
  type CreateTherapistBody,
  type ListTherapistsQuery,
  type UpdateTherapistBody,
} from "#app/modules/domains/users/therapists.admin.dto.ts";
import { type ParamId } from "#app/modules/general/dto/index.ts";
import type { FastifyInstance } from "fastify";

export default async function therapistsAdminController(app: FastifyInstance) {
  const service = new TherapistsService(app.drizzle);

  app.get<{ Querystring: ListTherapistsQuery }>(
    "/",
    { schema: listTherapistsSchema },
    async (req) => {
      const { page, limit, search, speciality, isActive, sortBy, sortOrder } =
        req.query;
      return service.all(
        { search, speciality, isActive },
        { page, limit },
        { sortBy, sortOrder },
      );
    },
  );

  app.get<{ Params: ParamId }>(
    "/:id",
    { schema: findTherapistSchema },
    async (req) => {
      return service.findOrFail(req.params.id);
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
      return service.update(req.params.id, req.body);
    },
  );

  app.delete<{ Params: ParamId }>(
    "/:id",
    { schema: deleteTherapistSchema },
    async (req) => {
      await service.destroy(req.params.id);
      return { success: true };
    },
  );
}
