import "dotenv/config";

import { type TypeBoxTypeProvider } from "@fastify/type-provider-typebox";

import { APP_DOMAIN, APP_PORT, APP_PROTOCOL } from "#app/config/app.ts";
import swaggerPlugin from "#app/plugins/docs/swagger.ts";
import Fastify from "fastify";
import { registerGlobalErrorHandler } from "./errors/registerGlobalErrorHandler.ts";

const app = Fastify({
  logger: true,
  ajv: {
    customOptions: {
      allErrors: true,
    },
  },
}).withTypeProvider<TypeBoxTypeProvider>();

registerGlobalErrorHandler(app);
app.register(swaggerPlugin);
app.register(async (app) => {
  app.get(
    "/posts",
    {
      schema: {
        response: {
          200: {},
        },
      },
    },
    async () => {
      return [];
    },
  );
});

await app.ready();

try {
  await app.listen({ port: APP_PORT });
  const address = app.server.address();
  const port = typeof address === "string" ? address : address?.port;
  console.log(`✨ Server running on ${APP_PROTOCOL}://${APP_DOMAIN}:${port}`);
  console.log(
    `📖 API documentation available at ${APP_PROTOCOL}://${APP_DOMAIN}:${port}/docs`,
  );
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
