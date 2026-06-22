import initDrizzleClient from "#app/database/drizzle-client.ts";
import { type FastifyInstance } from "fastify";

export default async function drizzlePlugin(app: FastifyInstance) {
  const db = initDrizzleClient();
  app.decorate("drizzle", db);
}

//@ts-expect-error
drizzlePlugin[Symbol.for("skip-override")] = true;
