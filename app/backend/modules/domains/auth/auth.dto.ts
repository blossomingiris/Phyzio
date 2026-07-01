import { errorResponse, fieldErrorResponse } from "#app/modules/general/dto/index.ts";
import Type, { type Static } from "typebox";

export const loginBody = Type.Object(
  {
    email: Type.String({ format: "email", maxLength: 255 }),
    password: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false },
);

const loginResponse = Type.Object({
  token: Type.String(),
});

export const loginSchema = {
  tags: ["Auth"],
  summary: "Login with email and password",
  body: loginBody,
  response: {
    200: loginResponse,
    400: fieldErrorResponse,
    401: errorResponse,
  },
};

export type LoginBody = Static<typeof loginBody>;
