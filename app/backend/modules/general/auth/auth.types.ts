import { type UserRole } from "#app/database/types.ts";
import "@fastify/jwt";

export type JwtPayload = {
  id: number;
  role: UserRole;
};

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: JwtPayload;
    user: JwtPayload;
  }
}
