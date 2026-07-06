import {
  AUTH_BCRYPT_ROUNDS,
  AUTH_REFRESH_TOKEN_EXPIRES_IN_SEC,
  AUTH_REFRESH_TOKEN_SALT,
} from "#app/config/auth.ts";
import type { DrizzleClient } from "#app/database/drizzle-client.ts";
import { refreshTokens, users } from "#app/database/schemas.ts";
import { UnauthorizedError } from "#app/errors/httpErrors.ts";
import { type JwtPayload } from "#app/modules/general/auth/auth.types.ts";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { createHmac } from "node:crypto";

const TIMING_GUARD_HASH = bcrypt.hashSync(
  "invalid-placeholder",
  AUTH_BCRYPT_ROUNDS,
);

function hash(value: string): string {
  return createHmac("sha256", AUTH_REFRESH_TOKEN_SALT)
    .update(value)
    .digest("hex");
}

export class AuthService {
  private db: DrizzleClient;

  constructor(db: DrizzleClient) {
    this.db = db;
  }

  async validateCredentials(
    email: string,
    password: string,
  ): Promise<JwtPayload> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email));

    const passwordMatches = await bcrypt.compare(
      password,
      user?.password ?? TIMING_GUARD_HASH,
    );

    if (!user || !passwordMatches) {
      throw new UnauthorizedError("Invalid credentials");
    }

    return { id: user.id, role: user.role };
  }

  async createRefreshToken(userId: number): Promise<string> {
    const token = crypto.randomUUID();
    const expiresAt = new Date(
      Date.now() + AUTH_REFRESH_TOKEN_EXPIRES_IN_SEC * 1000,
    );
    await this.db
      .insert(refreshTokens)
      .values({ userId, tokenHash: hash(token), expiresAt });
    return token;
  }

  async rotateRefreshToken(
    oldToken: string,
  ): Promise<{ refreshToken: string; jwtPayload: JwtPayload }> {
    const [row] = await this.db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.tokenHash, hash(oldToken)));

    if (!row || row.used || row.expiresAt < new Date()) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    await this.db
      .update(refreshTokens)
      .set({ used: true })
      .where(eq(refreshTokens.id, row.id));

    const [user] = await this.db
      .select({ id: users.id, role: users.role })
      .from(users)
      .where(eq(users.id, row.userId));

    if (!user) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    const refreshToken = await this.createRefreshToken(user.id);
    return { refreshToken, jwtPayload: { id: user.id, role: user.role } };
  }

  async deleteRefreshToken(token: string): Promise<void> {
    await this.db
      .delete(refreshTokens)
      .where(eq(refreshTokens.tokenHash, hash(token)));
  }
}
