import type { ApiError, ApiFieldError } from "./types";

function isApiError(error: unknown): error is ApiError | ApiFieldError {
  return (
    !!error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as ApiError | ApiFieldError).message === "string"
  );
}

export function isApiFieldError(error: unknown): error is ApiFieldError {
  return (
    isApiError(error) &&
    "errors" in error &&
    Array.isArray((error as ApiFieldError).errors)
  );
}

export function getApiErrorMessage(error: unknown): string {
  if (isApiError(error)) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}
