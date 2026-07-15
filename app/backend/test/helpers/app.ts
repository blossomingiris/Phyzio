import { AUTH_BCRYPT_ROUNDS } from "#app/config/auth.ts";
import type { DrizzleClient } from "#app/database/drizzle-client.ts";
import { users } from "#app/database/schemas.ts";
import { registerGlobalErrorHandler } from "#app/errors/registerGlobalErrorHandler.ts";
import cookiePlugin from "#app/plugins/cookie.plugin.ts";
import corsPlugin from "#app/plugins/cors.plugin.ts";
import databasePlugin from "#app/plugins/database.plugin.ts";
import jwtPlugin from "#app/plugins/jwt.plugin.ts";
import routes from "#app/plugins/routes.plugin.ts";
import swaggerPlugin from "#app/plugins/swagger.plugin.ts";
import { type TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import bcrypt from "bcrypt";
import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import Fastify from "fastify";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const MIGRATIONS_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../../drizzle");

export const ADMIN_EMAIL = "admin@test.com";
export const ADMIN_PASSWORD = "Test1234!";

export type TestApp = Awaited<ReturnType<typeof createTestApp>>;

export async function createTestApp() {
  const app = Fastify({
    logger: false,
    ajv: {
      customOptions: {
        allErrors: true,
        removeAdditional: false,
        discriminator: true,
        keywords: ["example"],
      },
    },
  }).withTypeProvider<TypeBoxTypeProvider>();

  registerGlobalErrorHandler(app);
  app.register(corsPlugin);
  app.register(databasePlugin);
  app.register(cookiePlugin);
  app.register(jwtPlugin);
  app.register(swaggerPlugin);
  app.register(routes);

  await app.ready();

  const db: DrizzleClient = app.drizzle;
  await migrate(db, { migrationsFolder: MIGRATIONS_DIR });

  return {
    inject: app.inject.bind(app),
    db,

    async clearAll() {
      await db.execute(
        sql`TRUNCATE users, clients, treatments RESTART IDENTITY CASCADE`,
      );
    },

    // The only direct DB insert in the suite — an admin cannot be created via
    // the API without already being an admin, so we bootstrap one here.
    async makeAdmin(overrides: Partial<{ email: string }> = {}) {
      const hash = await bcrypt.hash(ADMIN_PASSWORD, AUTH_BCRYPT_ROUNDS);
      const [user] = await db
        .insert(users)
        .values({
          firstName: "Admin",
          lastName: "Test",
          email: overrides.email ?? ADMIN_EMAIL,
          password: hash,
          role: "admin",
        })
        .returning();
      return user!;
    },

    async login(email: string, password = ADMIN_PASSWORD) {
      const res = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: { email, password },
      });

      if (res.statusCode !== 200) {
        throw new Error(`login failed (${res.statusCode}): ${res.body}`);
      }

      const body = res.json<{ token: string }>();
      const setCookie = res.headers["set-cookie"];
      const cookie = Array.isArray(setCookie)
        ? setCookie[0]
        : (setCookie ?? "");
      return { token: body.token, cookie };
    },

    async close() {
      await app.close();
    },
  };
}
