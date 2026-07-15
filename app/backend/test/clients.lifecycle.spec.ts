import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ADMIN_EMAIL, ADMIN_PASSWORD, createTestApp, type TestApp } from "./helpers/app.ts";

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

  it("soft-deletes a client: hidden by default, visible with deleted=true", async () => {
    const { id } = await createClient({ email: "delete@clients.test" });

    const del = await h.inject({ method: "DELETE", url: `/clients/${id}`, headers: auth() });
    expect(del.statusCode).toBe(200);
    expect(del.json<{ success: boolean }>().success).toBe(true);

    // Default reads exclude soft-deleted rows
    const hidden = await h.inject({ method: "GET", url: `/clients/${id}`, headers: auth() });
    expect(hidden.statusCode).toBe(404);

    // Admin can opt in to see the deleted record
    const shown = await h.inject({
      method: "GET",
      url: `/clients/${id}?deleted=true`,
      headers: auth(),
    });
    expect(shown.statusCode).toBe(200);
    expect(shown.json<{ deletedAt: string | null }>().deletedAt).not.toBeNull();
  });

  it("redacts personal fields once a client is deleted, keeping name and timestamps", async () => {
    const { id } = await createClient({
      email: "redact@clients.test",
      phone: "+1234567890",
      birthDate: "1990-01-01",
      origin: "walk_in",
      medicalNotes: "Confidential note",
    });

    await h.inject({ method: "DELETE", url: `/clients/${id}`, headers: auth() });

    const res = await h.inject({
      method: "GET",
      url: `/clients/${id}?deleted=true`,
      headers: auth(),
    });
    expect(res.statusCode).toBe(200);
    const body = res.json<{
      firstName: string;
      lastName: string;
      phone: string | null;
      email: string | null;
      birthDate: string | null;
      origin: string | null;
      preferredCommunication: string | null;
      medicalNotes: string | null;
      therapist: unknown;
      createdAt: string;
      deletedAt: string | null;
    }>();

    expect(body.firstName).toBe("John");
    expect(body.lastName).toBe("Doe");
    expect(body.createdAt).toBeTypeOf("string");
    expect(body.deletedAt).not.toBeNull();

    expect(body.phone).toBeNull();
    expect(body.email).toBeNull();
    expect(body.birthDate).toBeNull();
    expect(body.origin).toBeNull();
    expect(body.preferredCommunication).toBeNull();
    expect(body.medicalNotes).toBeNull();
    expect(body.therapist).toBeNull();
  });

  it("keeps the assigned therapist visible on a client after the therapist is soft-deleted", async () => {
    // History is preserved: the client's therapist summary is populated from a
    // leftJoin that intentionally does NOT filter the therapist's deletedAt.
    const therapistRes = await h.inject({
      method: "POST",
      url: "/therapists",
      headers: auth(),
      payload: {
        firstName: "Hist",
        lastName: "Therapist",
        email: "hist-therapist@clients.test",
        password: ADMIN_PASSWORD,
        speciality: "orthopedic",
        phone: "+1234567890",
        workingHours: {},
      },
    });
    expect(therapistRes.statusCode).toBe(201);
    const therapistId = therapistRes.json<{ id: number }>().id;

    const { id: clientId } = await createClient({
      email: "hist-client@clients.test",
      therapistId,
    });

    const del = await h.inject({
      method: "DELETE",
      url: `/therapists/${therapistId}`,
      headers: auth(),
    });
    expect(del.statusCode).toBe(200);

    const res = await h.inject({ method: "GET", url: `/clients/${clientId}`, headers: auth() });
    expect(res.statusCode).toBe(200);
    const body = res.json<{ therapist: { id: number } | null }>();
    expect(body.therapist).not.toBeNull();
    expect(body.therapist?.id).toBe(therapistId);
  });
});
