import {
  BadRequestError,
  ConflictError,
  type HttpError,
} from "./httpErrors.ts";

const DB_ERROR_FACTORIES: Record<string, () => HttpError> = {
  "23505": () => new ConflictError("Resource already exists"),
  "23503": () =>
    new ConflictError("Referenced record not found or still in use"),
  "23502": () => new BadRequestError("A required field is missing"),
  "23514": () => new BadRequestError("A field failed a constraint"),
  "22P02": () => new BadRequestError("Invalid input syntax"),
};

/**
 * Translates a raw database driver error into a domain `HttpError`, or returns
 * `undefined` if the error is not a recognised database error.
 */
export function translateDbError(error: unknown): HttpError | undefined {
  const code = (error as { code?: unknown })?.code;
  return typeof code === "string" ? DB_ERROR_FACTORIES[code]?.() : undefined;
}
