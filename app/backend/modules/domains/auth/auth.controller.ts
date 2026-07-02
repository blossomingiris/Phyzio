import {
  AUTH_COOKIE_SECURE,
  AUTH_REFRESH_TOKEN_EXPIRES_IN_SEC,
} from "#app/config/auth.ts";
import { UnauthorizedError } from "#app/errors/httpErrors.ts";
import { type FastifyInstance } from "fastify";
import {
  type LoginBody,
  loginSchema,
  logoutSchema,
  refreshSchema,
} from "./auth.dto.ts";
import { AuthService } from "./auth.service.ts";

const cookieOptions = {
  httpOnly: true,
  secure: AUTH_COOKIE_SECURE,
  sameSite: "strict" as const,
  path: "/auth",
  maxAge: AUTH_REFRESH_TOKEN_EXPIRES_IN_SEC,
};

export default async function authController(app: FastifyInstance) {
  const service = new AuthService(app.drizzle);

  app.post<{ Body: LoginBody }>(
    "/login",
    { schema: loginSchema },
    async (req, reply) => {
      const payload = await service.validateCredentials(
        req.body.email,
        req.body.password,
      );
      const token = await reply.jwtSign(payload);
      const refreshToken = await service.createRefreshToken(payload.id);
      reply.setCookie("refresh_token", refreshToken, cookieOptions);
      return { token };
    },
  );

  app.post("/refresh", { schema: refreshSchema }, async (req, reply) => {
    const oldToken = req.cookies["refresh_token"];
    if (!oldToken) throw new UnauthorizedError("Missing refresh token");

    const { refreshToken, jwtPayload } =
      await service.rotateRefreshToken(oldToken);
    const token = await reply.jwtSign(jwtPayload);
    reply.setCookie("refresh_token", refreshToken, cookieOptions);
    return { token };
  });

  app.post("/logout", { schema: logoutSchema }, async (req, reply) => {
    const token = req.cookies["refresh_token"];
    if (token) await service.deleteRefreshToken(token);
    reply.clearCookie("refresh_token", { path: "/auth" });
    return { success: true as const };
  });
}
