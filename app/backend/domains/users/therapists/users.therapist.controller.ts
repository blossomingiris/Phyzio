import { type ParamId } from "#app/domains/shared/dto/index.ts";
import {
  adminCreateTherapistSchema,
  adminDeleteTherapistSchema,
  adminFindTherapistSchema,
  adminListTherapistsSchema,
  adminUpdateTherapistSchema,
  type AdminCreateTherapistBody,
  type AdminListTherapistsQuery,
  type AdminUpdateTherapistBody,
} from "#app/domains/users/therapists/users.therapist.dto.ts";
import { TherapistsService } from "#app/domains/users/therapists/users.therapist.service.ts";
import type { FastifyInstance } from "fastify";

export default async function therapistsAdminController(app: FastifyInstance) {
  const service = new TherapistsService(app.drizzle);

  app.get<{ Querystring: AdminListTherapistsQuery }>(
    "/",
    { schema: adminListTherapistsSchema },
    async (req) => {
      const { page, limit, search, speciality, isActive } = req.query;
      return service.all({ search, speciality, isActive }, { page, limit });
    },
  );

  app.get<{ Params: ParamId }>(
    "/:id",
    { schema: adminFindTherapistSchema },
    async (req) => {
      return service.findOrFail(req.params.id);
    },
  );

  app.post<{ Body: AdminCreateTherapistBody }>(
    "/",
    { schema: adminCreateTherapistSchema },
    async (req, reply) => {
      const therapist = await service.create(req.body);
      return reply.code(201).send(therapist);
    },
  );

  app.patch<{ Params: ParamId; Body: AdminUpdateTherapistBody }>(
    "/:id",
    { schema: adminUpdateTherapistSchema },
    async (req) => {
      return service.update(req.params.id, req.body);
    },
  );

  app.delete<{ Params: ParamId }>(
    "/:id",
    { schema: adminDeleteTherapistSchema },
    async (req) => {
      await service.destroy(req.params.id);
      return { success: true };
    },
  );
}
