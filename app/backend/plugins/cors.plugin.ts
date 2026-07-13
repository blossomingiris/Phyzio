import { APP_CORS_ALLOWED_ORIGINS } from "#app/config/cors.ts";
import cors from "@fastify/cors";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

export default fp(async function corsPlugin(app: FastifyInstance) {
  app.register(cors, {
    origin: APP_CORS_ALLOWED_ORIGINS,
    methods: ["GET", "HEAD", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  });
});
