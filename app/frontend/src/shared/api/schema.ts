// Public type surface for the API layer, built over the generated OpenAPI schema.
export type { ApiPaths, ApiSchemas } from "./generated";

// The backend inlines every DTO, so `components.schemas` is empty and no named
// error type is generated. Declare the shared error-body shape by hand until the
// backend exposes named schemas via `$ref`.
export type ApiError = {
  code: string;
  message: string;
};
