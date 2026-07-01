import { APP_DATABASE_URL } from "#app/config/db.ts";
import * as schema from "#app/database/schemas.ts";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Client } from "pg";

export type DrizzleClient = NodePgDatabase<typeof schema>;

export default async function initDrizzleClient(): Promise<DrizzleClient> {
  const client = new Client({ connectionString: APP_DATABASE_URL });

  client.on("error", (err) => {
    console.error("[database] connection error:", err);
  });

  try {
    await client.connect();
  } catch (err) {
    console.error("[database] failed to connect:", err);
    throw err;
  }

  return drizzle(client, { schema });
}
