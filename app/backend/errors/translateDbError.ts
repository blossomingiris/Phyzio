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
  "22P02": () => new BadRequestError("Invalid input syntax"),
};

export type DbError = { code: string; table?: string };

/**
 * Unwraps the Postgres error from Drizzle.
 * Used by service `catch` blocks to read `code`/`table` and map DB errors to
 * domain `HttpError`s.
 * @param error - The value caught in a `catch` block.
 * @returns The pg error (`{ code, table }`), or `undefined` if not a DB error.
 */
export function getDbError(error: unknown): DbError | undefined {
  let current: unknown = error;
  while (current != null) {
    const code = (current as { code?: unknown }).code;
    if (typeof code === "string") return current as DbError;
    current = (current as { cause?: unknown }).cause;
  }
  return undefined;
}

export function translateDbError(error: unknown): HttpError | undefined {
  const code = getDbError(error)?.code;
  return code ? DB_ERROR_FACTORIES[code]?.() : undefined;
}
