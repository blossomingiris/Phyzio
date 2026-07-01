import type { FastifyReply, FastifyRequest } from "fastify";

export async function authOnly(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  await request.jwtVerify();
}
