// TODO: this controller requires auth plugin to extract the user ID from the JWT.
// Admin users calling PATCH /me/schedule will get a 404 — correct, they have no therapist row.
import { TherapistsService } from "#app/modules/domains/users/therapists.admin.service.ts";
import type { FastifyInstance } from "fastify";
import {
  updateMyScheduleSchema,
  type UpdateMyScheduleBody,
} from "./therapists.resource.dto.ts";

export default async function therapistsResourceController(
  app: FastifyInstance,
) {
  const service = new TherapistsService(app.drizzle);

  app.patch<{ Body: UpdateMyScheduleBody }>(
    "/schedule",
    { schema: updateMyScheduleSchema },
    async (req) => {
      // TODO: replace with req.user.id once auth is wired up
      const userId: number = (req as any).user?.id;
      await service.findOrFail(userId);
      return service.update(userId, req.body);
    },
  );
}
