import cors from "@fastify/cors";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { APP_CORS_ORIGIN } from "#app/config/app.ts";

export default fp(async function corsPlugin(app: FastifyInstance) {
  app.register(cors, {
    origin: APP_CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  });
});
