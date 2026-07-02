import {
  AUTH_BCRYPT_ROUNDS,
  AUTH_REFRESH_TOKEN_EXPIRES_IN_SEC,
} from "#app/config/auth.ts";
import type { DrizzleClient } from "#app/database/drizzle-client.ts";
import { refreshTokens, users } from "#app/database/schemas.ts";
import { UnauthorizedError } from "#app/errors/httpErrors.ts";
import { type JwtPayload } from "#app/modules/general/auth/auth.types.ts";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

const TIMING_GUARD_HASH = bcrypt.hashSync(
  "invalid-placeholder",
  AUTH_BCRYPT_ROUNDS,
);

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
    await this.db.insert(refreshTokens).values({ userId, token, expiresAt });
    return token;
  }

  async rotateRefreshToken(
    oldToken: string,
  ): Promise<{ refreshToken: string; jwtPayload: JwtPayload }> {
    const [row] = await this.db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.token, oldToken));

    if (!row || row.expiresAt < new Date()) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    await this.db.delete(refreshTokens).where(eq(refreshTokens.id, row.id));

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
    await this.db.delete(refreshTokens).where(eq(refreshTokens.token, token));
  }
}
