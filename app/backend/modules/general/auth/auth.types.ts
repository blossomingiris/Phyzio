import { type UserRole } from "#app/database/types.ts";
import "@fastify/jwt";

export type JwtPayload = {
  id: number;
};

export type AuthUser = {
  id: number;
  roles: UserRole[];
};

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: JwtPayload;
    user: JwtPayload;
  }
}
