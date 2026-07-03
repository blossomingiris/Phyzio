import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ADMIN_EMAIL, ADMIN_PASSWORD, createTestApp, type TestApp } from "./helpers/app.ts";

describe("auth lifecycle", () => {
  let h: TestApp;

  beforeAll(async () => {
    h = await createTestApp();
    await h.clearAll();
    await h.makeAdmin();
  });

  afterAll(async () => {
    await h.close();
  });

  describe("POST /auth/login", () => {
    it("returns a JWT and sets refresh cookie for valid credentials", async () => {
      const res = await h.inject({
        method: "POST",
        url: "/auth/login",
        payload: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
      });
      expect(res.statusCode).toBe(200);
      expect(res.json<{ token: string }>().token).toBeTypeOf("string");
      expect(res.headers["set-cookie"]).toBeTruthy();
    });

    it("returns 401 for wrong password", async () => {
      const res = await h.inject({
        method: "POST",
        url: "/auth/login",
        payload: { email: ADMIN_EMAIL, password: "WrongPass1" },
      });
      expect(res.statusCode).toBe(401);
    });

    it("returns 401 for unknown email", async () => {
      const res = await h.inject({
        method: "POST",
        url: "/auth/login",
        payload: { email: "nobody@example.com", password: ADMIN_PASSWORD },
      });
      expect(res.statusCode).toBe(401);
    });
  });

  describe("POST /auth/refresh", () => {
    it("returns a new JWT and rotates the refresh cookie", async () => {
      const { cookie } = await h.login(ADMIN_EMAIL);
      const res = await h.inject({
        method: "POST",
        url: "/auth/refresh",
        headers: { cookie },
      });
      expect(res.statusCode).toBe(200);
      expect(res.json<{ token: string }>().token).toBeTypeOf("string");
      expect(res.headers["set-cookie"]).toBeTruthy();
    });

    it("returns 401 when refresh cookie is missing", async () => {
      const res = await h.inject({ method: "POST", url: "/auth/refresh" });
      expect(res.statusCode).toBe(401);
    });

    it("returns 401 when the same token is reused after rotation", async () => {
      const { cookie } = await h.login(ADMIN_EMAIL);
      await h.inject({ method: "POST", url: "/auth/refresh", headers: { cookie } });
      const res = await h.inject({ method: "POST", url: "/auth/refresh", headers: { cookie } });
      expect(res.statusCode).toBe(401);
    });
  });

  describe("POST /auth/logout", () => {
    it("invalidates the refresh token so a subsequent refresh fails", async () => {
      const { cookie } = await h.login(ADMIN_EMAIL);

      const logoutRes = await h.inject({
        method: "POST",
        url: "/auth/logout",
        headers: { cookie },
      });
      expect(logoutRes.statusCode).toBe(200);

      const refreshRes = await h.inject({
        method: "POST",
        url: "/auth/refresh",
        headers: { cookie },
      });
      expect(refreshRes.statusCode).toBe(401);
    });

    it("succeeds with no cookie (idempotent)", async () => {
      const res = await h.inject({ method: "POST", url: "/auth/logout" });
      expect(res.statusCode).toBe(200);
    });
  });
});
