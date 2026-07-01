import type { FastifyServerOptions } from "fastify";

const LOGGER_IS_DEV = process.env.NODE_ENV !== "production";

export const LOGGER_OPTIONS: FastifyServerOptions["logger"] = {
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "password",
      "*.password",
      "token",
      "*.token",
    ],
    censor: "[REDACTED]",
  },
  transport: LOGGER_IS_DEV
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss",
          ignore: "pid,hostname",
          singleLine: true,
        },
      }
    : undefined,
  serializers: {
    req(request) {
      return { method: request.method, url: request.url };
    },
    res(reply) {
      return { statusCode: reply.statusCode };
    },
  },
};
