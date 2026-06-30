import Type from "typebox";

export const errorResponse = Type.Object({
  code: Type.String(),
  message: Type.String(),
});

// Response shape for errors that carry field-level detail — used for:
// 400 (BadRequestError) and 422 (UnprocessableEntityError)

export const fieldErrorResponse = Type.Object({
  code: Type.String(),
  message: Type.String(),
  errors: Type.Array(
    Type.Object({
      field: Type.String(),
      message: Type.String(),
    }),
  ),
});
