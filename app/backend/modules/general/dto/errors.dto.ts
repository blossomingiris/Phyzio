import Type, { type Static, type TSchema } from "typebox";

// Concrete error-body schemas. These carry an `$id` so they can be registered
// as shared Fastify schemas (see `errorSchemas`) and surface in the OpenAPI
// document under `components.schemas`, which lets the frontend derive a named
// error type instead of hand-declaring it.

export const errorResponseSchema = Type.Object(
  {
    code: Type.String(),
    message: Type.String(),
  },
  { $id: "ApiError" },
);

// Response shape for errors that carry field-level detail — used for:
// 400 (BadRequestError) and 422 (UnprocessableEntityError)

export const fieldErrorResponseSchema = Type.Object(
  {
    code: Type.String(),
    message: Type.String(),
    errors: Type.Array(
      Type.Object({
        field: Type.String(),
        message: Type.String(),
      }),
    ),
  },
  { $id: "ApiFieldError" },
);

export const errorSchemas: TSchema[] = [
  errorResponseSchema,
  fieldErrorResponseSchema,
];

export const errorResponse = Type.Ref("ApiError");
export const fieldErrorResponse = Type.Ref("ApiFieldError");

export type ApiError = Static<typeof errorResponseSchema>;
export type ApiFieldError = Static<typeof fieldErrorResponseSchema>;
