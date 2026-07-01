import "dotenv/config";

import { type TypeBoxTypeProvider } from "@fastify/type-provider-typebox";

import { APP_DOMAIN, APP_PORT, APP_PROTOCOL } from "#app/config/app.ts";
import { LOGGER_OPTIONS } from "#app/config/logger.ts";
import Fastify from "fastify";
import { registerGlobalErrorHandler } from "./errors/registerGlobalErrorHandler.ts";
import databasePlugin from "./plugins/database.plugin.ts";
import jwtPlugin from "./plugins/jwt.plugin.ts";
import routes from "./plugins/routes.plugin.ts";
import swaggerPlugin from "./plugins/swagger.plugin.ts";

const app = Fastify({
  logger: LOGGER_OPTIONS,
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
app.register(databasePlugin);
app.register(jwtPlugin);
app.register(swaggerPlugin);
app.register(routes);

await app.ready();

try {
  await app.listen({ port: APP_PORT });
  const address = app.server.address();
  const PORT = typeof address === "string" ? address : address?.port;
  app.log.info(
    `API documentation available at ${APP_PROTOCOL}://${APP_DOMAIN}:${PORT}/docs`,
  );
} catch (error) {
  app.log.error({ err: error }, "Failed to start server");
  process.exit(1);
}
