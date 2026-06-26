// TODO: this controller requires auth plugin to extract the user ID from the JWT.
import { TherapistsService } from "#app/modules/domains/users/therapists.admin.service.ts";
import { UsersService } from "#app/modules/domains/users/users.admin.service.ts";
import type { FastifyInstance } from "fastify";
import {
  getMeSchema,
  updateMePasswordSchema,
  updateMeSchema,
  type UpdateMeBody,
  type UpdateMePasswordBody,
} from "./users.resource.dto.ts";

export default async function usersResourceController(app: FastifyInstance) {
  const userService = new UsersService(app.drizzle);
  const therapistService = new TherapistsService(app.drizzle);

  async function getMe(userId: number) {
    const user = await userService.findOrFail(userId);
    const therapist = await therapistService.one({ id: userId });
    return {
      ...user,
      therapist: therapist
        ? {
            speciality: therapist.speciality,
            phone: therapist.phone,
            workingHours: therapist.workingHours,
            isActive: therapist.isActive,
          }
        : undefined,
    };
  }

  app.get("/", { schema: getMeSchema }, async (req) => {
    // TODO: replace with req.user.id once auth is wired up
    const userId: number = (req as any).user?.id;
    return getMe(userId);
  });

  app.patch<{ Body: UpdateMeBody }>(
    "/",
    { schema: updateMeSchema },
    async (req) => {
      // TODO: replace with req.user.id once auth is wired up
      const userId: number = (req as any).user?.id;
      await userService.findOrFail(userId);

      const { phone, workingHours, ...userFields } = req.body;

      if (Object.keys(userFields).length > 0) {
        await userService.update(userId, userFields);
      }

      if (phone !== undefined || workingHours !== undefined) {
        const therapist = await therapistService.one({ id: userId });
        if (therapist) {
          await therapistService.update(userId, { phone, workingHours });
        }
      }

      return getMe(userId);
    },
  );

  app.patch<{ Body: UpdateMePasswordBody }>(
    "/password",
    { schema: updateMePasswordSchema },
    async (req) => {
      // TODO: replace with req.user.id once auth is wired up
      const userId: number = (req as any).user?.id;
      await userService.findOrFail(userId);

      // TODO: verify req.body.currentPassword against stored hash
      // TODO: hash req.body.newPassword before storing
      await userService.updatePassword(userId, req.body.newPassword);

      return getMe(userId);
    },
  );
}
