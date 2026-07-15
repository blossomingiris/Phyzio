import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { type FastifyInstance } from "fastify";
import fp from "fastify-plugin";

import {
  errorSchemas,
  sharedSchemas,
} from "#app/modules/general/dto/index.ts";

export default fp(async function swaggerPlugin(app: FastifyInstance) {
  await app.register(fastifySwagger, {
    openapi: {
      openapi: "3.0.3",
      info: {
        title: "Phyzio",
        description: "Phyzio API documentation",
        version: "1.0.0",
      },
      security: [{ bearerAuth: [] }],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    },
    refResolver: {
      buildLocalReference: (json, _baseUri, _fragment, i) =>
        (json.$id as string) ?? `def-${i}`,
    },
  });

  for (const schema of [...errorSchemas, ...sharedSchemas]) {
    app.addSchema(schema);
  }

  await app.register(fastifySwaggerUi, {
    routePrefix: "/docs",
  });
});
