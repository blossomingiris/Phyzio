import { type FastifyInstance } from "fastify";
import { type LoginBody, loginSchema } from "./auth.dto.ts";
import { AuthService } from "./auth.service.ts";

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
      return { token };
    },
  );
}
