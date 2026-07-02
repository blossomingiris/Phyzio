import { AUTH_BCRYPT_ROUNDS } from "#app/config/auth.ts";
import type { DrizzleClient } from "#app/database/drizzle-client.ts";
import { users } from "#app/database/schemas.ts";
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
}
