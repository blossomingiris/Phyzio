import {
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

/**
 * Registers a global error handler that maps thrown errors to JSON responses.
 *
 * - Schema validation failure (AJV) → 400 with `errors` array
 * - `BadRequestError` / `UnprocessableEntityError` → their status code + `errors` array
 * - Other `HttpError` subclasses → their status code + message
 * - Unhandled errors → 500, logged via `request.log.error`
 *
 * @example
 * registerGlobalErrorHandler(app);
 */
export function registerGlobalErrorHandler(app: FastifyInstance) {
  app.setErrorHandler(
    (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
      if (error.validation) {
        return reply.code(400).send({
          code: error.code,
          message: error.message,
          errors: error.validation,
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
