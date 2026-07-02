export const AUTH_BCRYPT_ROUNDS: number = +process.env.BCRYPT_ROUNDS!;
export const AUTH_JWT_SECRET: string = process.env.JWT_SECRET!;
export const AUTH_JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN!;
export const AUTH_REFRESH_TOKEN_EXPIRES_IN_SEC: number =
  +process.env.REFRESH_TOKEN_EXPIRES_IN_SEC!;
export const AUTH_COOKIE_SECURE: boolean =
  process.env.NODE_ENV === "production";
