import { AUTH_JWT_EXPIRES_IN, AUTH_JWT_SECRET } from "#app/config/auth.ts";
import fastifyJwt from "@fastify/jwt";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";

export default fp(async function jwtPlugin(app: FastifyInstance) {
  app.register(fastifyJwt, {
    secret: AUTH_JWT_SECRET,
    sign: { expiresIn: AUTH_JWT_EXPIRES_IN },
  });

  app.decorate(
    "auth",
    async function (request: FastifyRequest, reply: FastifyReply) {
      try {
        await request.jwtVerify();
      } catch (error) {
        reply.send(error);
      }
    },
  );
});
