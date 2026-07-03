import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ADMIN_EMAIL, createTestApp, type TestApp } from "./helpers/app.ts";

describe("treatments lifecycle", () => {
  let h: TestApp;
  let adminToken: string;

  beforeAll(async () => {
    h = await createTestApp();
    await h.clearAll();
    await h.makeAdmin();
    ({ token: adminToken } = await h.login(ADMIN_EMAIL));
  });

  afterAll(async () => {
    await h.close();
  });

  const auth = () => ({ authorization: `Bearer ${adminToken}` });

  const baseTreatment = {
    category: "ortho_sports" as const,
    pricePerUnit: "100.00",
    quantity: 10,
    durationMinutes: 60,
  };

  async function createTreatment(overrides: Record<string, unknown> = {}) {
    const res = await h.inject({
      method: "POST",
      url: "/treatments",
      headers: auth(),
      payload: { ...baseTreatment, ...overrides },
    });
    if (res.statusCode !== 201) throw new Error(`createTreatment failed: ${res.body}`);
    return res.json<{ id: number; totalAmount: string | null }>();
  }

  it("creates a treatment and computes totalAmount", async () => {
    const res = await h.inject({
      method: "POST",
      url: "/treatments",
      headers: auth(),
      payload: baseTreatment,
    });
    expect(res.statusCode).toBe(201);
    const body = res.json<{ totalAmount: string | null; isActive: boolean }>();
    expect(body.totalAmount).toBe("1000.00"); // 100.00 * 10
    expect(body.isActive).toBe(true);
  });

  it("lists treatments", async () => {
    const res = await h.inject({ method: "GET", url: "/treatments", headers: auth() });
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.json<{ data: unknown[] }>().data)).toBe(true);
  });

  it("finds a treatment by ID", async () => {
    const { id } = await createTreatment();
    const res = await h.inject({ method: "GET", url: `/treatments/${id}`, headers: auth() });
    expect(res.statusCode).toBe(200);
    expect(res.json<{ id: number }>().id).toBe(id);
  });

  it("returns 404 for a nonexistent treatment", async () => {
    const res = await h.inject({ method: "GET", url: "/treatments/999999", headers: auth() });
    expect(res.statusCode).toBe(404);
  });

  it("deactivates a treatment", async () => {
    const { id } = await createTreatment();
    const res = await h.inject({
      method: "PATCH",
      url: `/treatments/${id}`,
      headers: auth(),
      payload: { isActive: false },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json<{ isActive: boolean }>().isActive).toBe(false);
  });

  it("recalculates totalAmount when quantity changes", async () => {
    const { id } = await createTreatment({ pricePerUnit: "50.00", quantity: 4 });
    const res = await h.inject({
      method: "PATCH",
      url: `/treatments/${id}`,
      headers: auth(),
      payload: { quantity: 8 },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json<{ totalAmount: string | null }>().totalAmount).toBe("400.00"); // 50.00 * 8
  });
});
