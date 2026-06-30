import type {
  FastifyError,
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import {
  BadRequestError,
  HttpError,
  UnprocessableEntityError,
} from "./httpErrors.ts";

export function registerGlobalErrorHandler(app: FastifyInstance) {
  app.setErrorHandler(
    (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
      if (error.validation) {
        return reply.code(400).send({
          code: "VALIDATION_ERROR",
          message: error.message,
          errors: error.validation.map((e) => {
            const rawPath = e.instancePath
              .replace(/^\/(body|querystring|params|headers)(\/|$)/, "")
              .replace(/\//g, ".");
            const field =
              rawPath ||
              (e.params as { missingProperty?: string })?.missingProperty ||
              "";
            return { field, message: e.message ?? "Invalid value" };
          }),
        });
      }

      if (
        error instanceof BadRequestError ||
        error instanceof UnprocessableEntityError
      ) {
        return reply.code(error.statusCode).send({
          code: error.code,
          message: error.message,
          errors: error.errors,
        });
      }

      if (error instanceof HttpError) {
        return reply
          .code(error.statusCode)
          .send({ code: error.code, message: error.message });
      }

      request.log.error(error);
      return reply.code(500).send({ error: "Internal Server Error" });
    },
  );
}
