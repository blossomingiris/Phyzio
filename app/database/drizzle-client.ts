import { APP_DATABASE_URL } from "#app/config/db.ts";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";

export type DrizzleClient = ReturnType<typeof drizzle>;

export default async function initDrizzleClient(): Promise<DrizzleClient> {
  const client = new Client({ connectionString: APP_DATABASE_URL });
  await client.connect();

  const db = drizzle(client);

  return db as unknown as DrizzleClient;
}
