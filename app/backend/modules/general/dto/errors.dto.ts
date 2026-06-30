import Type from "typebox";

export const errorResponse = Type.Object({
  code: Type.String(),
  message: Type.String(),
});

export const validationErrorResponse = Type.Object({
  code: Type.String(),
  message: Type.String(),
  errors: Type.Array(
    Type.Object({
      field: Type.String(),
      message: Type.String(),
    }),
  ),
});
