import { AUTH_JWT_EXPIRES_IN, AUTH_JWT_SECRET } from "#app/config/auth.ts";
import fastifyJwt from "@fastify/jwt";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

export default fp(async function jwtPlugin(app: FastifyInstance) {
  app.register(fastifyJwt, {
    secret: AUTH_JWT_SECRET,
    sign: { expiresIn: AUTH_JWT_EXPIRES_IN },
  });
});
