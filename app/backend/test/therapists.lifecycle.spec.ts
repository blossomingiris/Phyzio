// - Admin creates a therapist (201) and it appears in the list
// - Find by ID returns the therapist; nonexistent ID returns 404
// - Update changes a field (phone)
// - Duplicate email is rejected (409)
// - Delete is a soft delete: stamps deletedAt, returns success
//   NOTE: reads do NOT currently filter deletedAt, so the record stays visible
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ADMIN_EMAIL, ADMIN_PASSWORD, createTestApp, type TestApp } from "./helpers/app.ts";

describe("therapists lifecycle", () => {
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

  let emailSeq = 0;
  const baseTherapist = () => ({
    firstName: "Ther",
    lastName: "Apist",
    email: `therapist-${emailSeq++}@lifecycle.test`,
    password: ADMIN_PASSWORD,
    speciality: "orthopedic" as const,
    phone: "+1234567890",
    workingHours: {},
  });

  async function createTherapist(overrides: Record<string, unknown> = {}) {
    const res = await h.inject({
      method: "POST",
      url: "/therapists",
      headers: auth(),
      payload: { ...baseTherapist(), ...overrides },
    });
    if (res.statusCode !== 201) throw new Error(`createTherapist failed: ${res.body}`);
    return res.json<{ id: number }>();
  }

  it("creates a therapist and lists it", async () => {
    const { id } = await createTherapist();
    const res = await h.inject({ method: "GET", url: "/therapists", headers: auth() });
    expect(res.statusCode).toBe(200);
    const { data } = res.json<{ data: { id: number }[] }>();
    expect(data.some((t) => t.id === id)).toBe(true);
  });

  it("finds a therapist by ID", async () => {
    const { id } = await createTherapist();
    const res = await h.inject({ method: "GET", url: `/therapists/${id}`, headers: auth() });
    expect(res.statusCode).toBe(200);
    expect(res.json<{ id: number }>().id).toBe(id);
  });

  it("returns 404 for a nonexistent therapist", async () => {
    const res = await h.inject({ method: "GET", url: "/therapists/999999", headers: auth() });
    expect(res.statusCode).toBe(404);
  });

  it("updates a therapist's phone", async () => {
    const { id } = await createTherapist();
    const res = await h.inject({
      method: "PATCH",
      url: `/therapists/${id}`,
      headers: auth(),
      payload: { phone: "+9990001111" },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json<{ phone: string }>().phone).toBe("+9990001111");
  });

  it("returns 409 when email is already taken", async () => {
    const email = "dup@therapists.test";
    await createTherapist({ email });
    const res = await h.inject({
      method: "POST",
      url: "/therapists",
      headers: auth(),
      payload: { ...baseTherapist(), email },
    });
    expect(res.statusCode).toBe(409);
  });

  it("soft-deletes a therapist (stamps deletedAt)", async () => {
    const { id } = await createTherapist();

    const del = await h.inject({ method: "DELETE", url: `/therapists/${id}`, headers: auth() });
    expect(del.statusCode).toBe(200);
    expect(del.json<{ success: boolean }>().success).toBe(true);

    // Current behavior: reads don't filter deletedAt, so the row remains fetchable
    // with deletedAt populated. When includeDeleted is added, this flips to 404 by default.
    const res = await h.inject({ method: "GET", url: `/therapists/${id}`, headers: auth() });
    expect(res.statusCode).toBe(200);
    expect(res.json<{ deletedAt: string | null }>().deletedAt).not.toBeNull();
  });
});
