import {
  errorResponse,
  fieldErrorResponse,
} from "#app/modules/general/dto/index.ts";
import Type, { type Static } from "typebox";

export const loginBody = Type.Object(
  {
    email: Type.String({
      format: "email",
      maxLength: 255,
      example: "admin@phyzio.test",
    }),
    password: Type.String({ minLength: 1, example: "password123" }),
  },
  { additionalProperties: false },
);

const tokenResponse = Type.Object({
  token: Type.String(),
});

const tag = { tags: ["Auth"] as const };

export const loginSchema = {
  ...tag,
  summary: "Login with email and password",
  security: [],
  body: loginBody,
  response: {
    200: tokenResponse,
    400: fieldErrorResponse,
    401: errorResponse,
  },
};

export const refreshSchema = {
  ...tag,
  summary: "Exchange the refresh token cookie for a new access token",
  security: [],
  response: {
    200: tokenResponse,
    401: errorResponse,
  },
};

export const logoutSchema = {
  ...tag,
  summary: "Revoke the refresh token cookie",
  security: [],
  response: {
    200: Type.Object({ success: Type.Literal(true) }),
  },
};

export type LoginBody = Static<typeof loginBody>;
