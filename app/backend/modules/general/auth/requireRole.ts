import { ForbiddenError } from "#app/errors/httpErrors.ts";
import type { UserRole } from "#app/database/types.ts";
import type { FastifyReply, FastifyRequest } from "fastify";

export function requireRole(...roles: UserRole[]) {
  return async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    await request.jwtVerify();
    if (!roles.includes(request.user.role)) {
      throw new ForbiddenError("Forbidden");
    }
  };
}

export const adminOnly = requireRole("admin");
