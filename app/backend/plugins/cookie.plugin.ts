import fastifyCookie from "@fastify/cookie";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

export default fp(async function cookiePlugin(app: FastifyInstance) {
  app.register(fastifyCookie);
});
