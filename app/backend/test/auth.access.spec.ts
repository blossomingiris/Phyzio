import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ADMIN_EMAIL, ADMIN_PASSWORD, createTestApp, type TestApp } from "./helpers/app.ts";

const ADMIN_ROUTES = [
  { method: "GET" as const, url: "/users" },
  { method: "GET" as const, url: "/therapists" },
  { method: "GET" as const, url: "/clients" },
  { method: "GET" as const, url: "/treatments" },
  { method: "GET" as const, url: "/appointments" },
  { method: "GET" as const, url: "/treatment-plans" },
];

describe("access control", () => {
  let h: TestApp;
  let adminToken: string;
  let therapistToken: string;

  beforeAll(async () => {
    h = await createTestApp();
    await h.clearAll();
    await h.makeAdmin();

    ({ token: adminToken } = await h.login(ADMIN_EMAIL));

    const res = await h.inject({
      method: "POST",
      url: "/therapists",
      headers: { authorization: `Bearer ${adminToken}` },
      payload: {
        firstName: "Jane",
        lastName: "Therapist",
        email: "therapist@test.com",
        password: ADMIN_PASSWORD,
        speciality: "orthopedic",
        phone: "+1234567890",
        workingHours: {},
      },
    });
    if (res.statusCode !== 201) {
      throw new Error(`therapist setup failed: ${res.body}`);
    }

    ({ token: therapistToken } = await h.login("therapist@test.com"));
  });

  afterAll(async () => {
    await h.close();
  });

  for (const route of ADMIN_ROUTES) {
    it(`${route.method} ${route.url} — 401 without token`, async () => {
      const res = await h.inject({ method: route.method, url: route.url });
      expect(res.statusCode).toBe(401);
    });

    it(`${route.method} ${route.url} — 403 for therapist`, async () => {
      const res = await h.inject({
        method: route.method,
        url: route.url,
        headers: { authorization: `Bearer ${therapistToken}` },
      });
      expect(res.statusCode).toBe(403);
    });

    it(`${route.method} ${route.url} — 200 for admin`, async () => {
      const res = await h.inject({
        method: route.method,
        url: route.url,
        headers: { authorization: `Bearer ${adminToken}` },
      });
      expect(res.statusCode).toBe(200);
    });
  }
});
