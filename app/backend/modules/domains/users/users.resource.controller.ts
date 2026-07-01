import { AUTH_BCRYPT_ROUNDS } from "#app/config/auth.ts";
import { UnauthorizedError } from "#app/errors/httpErrors.ts";
import { authOnly } from "#app/modules/general/auth/authOnly.ts";
import bcrypt from "bcrypt";
import type { FastifyInstance } from "fastify";
import { TherapistsService } from "./therapists.admin.service.ts";
import { UsersService } from "./users.admin.service.ts";
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

  app.addHook("preHandler", authOnly);

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
    return getMe(req.user.id);
  });

  app.patch<{ Body: UpdateMeBody }>(
    "/",
    { schema: updateMeSchema },
    async (req) => {
      await userService.findOrFail(req.user.id);

      const { phone, workingHours, ...userFields } = req.body;

      if (Object.keys(userFields).length > 0) {
        await userService.update(req.user.id, userFields);
      }

      if (phone !== undefined || workingHours !== undefined) {
        const therapist = await therapistService.one({ id: req.user.id });
        if (therapist) {
          await therapistService.update(req.user.id, { phone, workingHours });
        }
      }

      return getMe(req.user.id);
    },
  );

  app.patch<{ Body: UpdateMePasswordBody }>(
    "/password",
    { schema: updateMePasswordSchema },
    async (req) => {
      const user = await userService.findOrFail(req.user.id);

      const currentPasswordMatches = await bcrypt.compare(
        req.body.currentPassword,
        user.password,
      );

      if (!currentPasswordMatches) {
        throw new UnauthorizedError("Current password is incorrect");
      }

      const newHashedPassword = await bcrypt.hash(
        req.body.newPassword,
        AUTH_BCRYPT_ROUNDS,
      );
      await userService.updatePassword(req.user.id, newHashedPassword);

      return getMe(req.user.id);
    },
  );
}
