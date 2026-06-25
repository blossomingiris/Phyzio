import initDrizzleClient, {
  type DrizzleClient,
} from "#app/database/drizzle-client.ts";
import { type FastifyInstance } from "fastify";
import fp from "fastify-plugin";

declare module "fastify" {
  interface FastifyInstance {
    drizzle: DrizzleClient;
  }
}

export default fp(async function drizzlePlugin(app: FastifyInstance) {
  const db = await initDrizzleClient();
  app.decorate("drizzle", db);
});
