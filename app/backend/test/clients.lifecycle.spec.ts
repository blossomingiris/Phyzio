import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ADMIN_EMAIL, createTestApp, type TestApp } from "./helpers/app.ts";

describe("clients lifecycle", () => {
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

  const baseClient = {
    firstName: "John",
    lastName: "Doe",
    preferredCommunication: "email" as const,
  };

  async function createClient(overrides: Record<string, unknown> = {}) {
    const res = await h.inject({
      method: "POST",
      url: "/clients",
      headers: auth(),
      payload: { ...baseClient, ...overrides },
    });
    if (res.statusCode !== 201) throw new Error(`createClient failed: ${res.body}`);
    return res.json<{ id: number }>();
  }

  it("creates a client", async () => {
    const res = await h.inject({
      method: "POST",
      url: "/clients",
      headers: auth(),
      payload: baseClient,
    });
    expect(res.statusCode).toBe(201);
    expect(res.json<{ id: number }>().id).toBeTypeOf("number");
  });

  it("lists clients", async () => {
    const res = await h.inject({ method: "GET", url: "/clients", headers: auth() });
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.json<{ data: unknown[] }>().data)).toBe(true);
  });

  it("finds a client by ID", async () => {
    const { id } = await createClient({ email: "findme@clients.test" });
    const res = await h.inject({ method: "GET", url: `/clients/${id}`, headers: auth() });
    expect(res.statusCode).toBe(200);
    expect(res.json<{ id: number }>().id).toBe(id);
  });

  it("returns 404 for a nonexistent client", async () => {
    const res = await h.inject({ method: "GET", url: "/clients/999999", headers: auth() });
    expect(res.statusCode).toBe(404);
  });

  it("updates a client", async () => {
    const { id } = await createClient({ email: "update@clients.test" });
    const res = await h.inject({
      method: "PATCH",
      url: `/clients/${id}`,
      headers: auth(),
      payload: { firstName: "Updated" },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json<{ firstName: string }>().firstName).toBe("Updated");
  });

  it("returns 409 when email is already taken", async () => {
    const email = "dup@clients.test";
    await createClient({ email });
    const res = await h.inject({
      method: "POST",
      url: "/clients",
      headers: auth(),
      payload: { ...baseClient, email },
    });
    expect(res.statusCode).toBe(409);
  });

  it("soft-deletes a client", async () => {
    const { id } = await createClient({ email: "delete@clients.test" });
    const res = await h.inject({ method: "DELETE", url: `/clients/${id}`, headers: auth() });
    expect(res.statusCode).toBe(200);
    expect(res.json<{ success: boolean }>().success).toBe(true);
  });
});
