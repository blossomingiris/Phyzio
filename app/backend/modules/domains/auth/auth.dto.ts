import { errorResponse, fieldErrorResponse } from "#app/modules/general/dto/index.ts";
import Type, { type Static } from "typebox";

export const loginBody = Type.Object(
  {
    email: Type.String({ format: "email", maxLength: 255, example: "admin@phyzio.test" }),
    password: Type.String({ minLength: 1, example: "password123" }),
  },
  { additionalProperties: false },
);

const loginResponse = Type.Object({
  token: Type.String(),
});

const tag = { tags: ["Auth"] as const };

export const loginSchema = {
  ...tag,
  summary: "Login with email and password",
  security: [],
  body: loginBody,
  response: {
    200: loginResponse,
    400: fieldErrorResponse,
    401: errorResponse,
  },
};

export type LoginBody = Static<typeof loginBody>;
