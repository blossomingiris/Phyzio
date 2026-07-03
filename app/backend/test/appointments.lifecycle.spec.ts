import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ADMIN_EMAIL, ADMIN_PASSWORD, createTestApp, type TestApp } from "./helpers/app.ts";

describe("appointments lifecycle", () => {
  let h: TestApp;
  let adminToken: string;
  let therapistToken: string;
  let therapistId: number;
  let clientId: number;

  beforeAll(async () => {
    h = await createTestApp();
    await h.clearAll();
    await h.makeAdmin();
    ({ token: adminToken } = await h.login(ADMIN_EMAIL));

    const therapistRes = await h.inject({
      method: "POST",
      url: "/therapists",
      headers: { authorization: `Bearer ${adminToken}` },
      payload: {
        firstName: "Appt",
        lastName: "Therapist",
        email: "appt-therapist@test.com",
        password: ADMIN_PASSWORD,
        speciality: "orthopedic",
        phone: "+1234567890",
        workingHours: {},
      },
    });
    if (therapistRes.statusCode !== 201) throw new Error(`therapist setup failed: ${therapistRes.body}`);
    therapistId = therapistRes.json<{ id: number }>().id;
    ({ token: therapistToken } = await h.login("appt-therapist@test.com"));

    const clientRes = await h.inject({
      method: "POST",
      url: "/clients",
      headers: { authorization: `Bearer ${adminToken}` },
      payload: {
        firstName: "Appt",
        lastName: "Client",
        preferredCommunication: "email",
        therapistId,
      },
    });
    if (clientRes.statusCode !== 201) throw new Error(`client setup failed: ${clientRes.body}`);
    clientId = clientRes.json<{ id: number }>().id;
  });

  afterAll(async () => {
    await h.close();
  });

  const adminAuth = () => ({ authorization: `Bearer ${adminToken}` });
  const therapistAuth = () => ({ authorization: `Bearer ${therapistToken}` });

  // Each call gets its own non-overlapping 1-hour slot to avoid conflict errors
  let slotIndex = 0;
  function nextSlot() {
    const base = new Date("2026-08-01T08:00:00Z");
    base.setHours(base.getHours() + slotIndex++);
    const end = new Date(base);
    end.setHours(end.getHours() + 1);
    return { startedAt: base.toISOString(), endedAt: end.toISOString() };
  }

  async function createAppointment() {
    const res = await h.inject({
      method: "POST",
      url: "/appointments",
      headers: adminAuth(),
      payload: { clientId, therapistId, ...nextSlot() },
    });
    if (res.statusCode !== 201) throw new Error(`createAppointment failed: ${res.body}`);
    return res.json<{ id: number; status: string }>();
  }

  it("admin creates an appointment", async () => {
    const res = await h.inject({
      method: "POST",
      url: "/appointments",
      headers: adminAuth(),
      payload: { clientId, therapistId, ...nextSlot() },
    });
    expect(res.statusCode).toBe(201);
    expect(res.json<{ status: string }>().status).toBe("requested");
  });

  it("lists appointments", async () => {
    const res = await h.inject({ method: "GET", url: "/appointments", headers: adminAuth() });
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.json<{ data: unknown[] }>().data)).toBe(true);
  });

  it("finds an appointment by ID", async () => {
    const { id } = await createAppointment();
    const res = await h.inject({ method: "GET", url: `/appointments/${id}`, headers: adminAuth() });
    expect(res.statusCode).toBe(200);
    expect(res.json<{ id: number }>().id).toBe(id);
  });

  it("returns 404 for a nonexistent appointment", async () => {
    const res = await h.inject({ method: "GET", url: "/appointments/999999", headers: adminAuth() });
    expect(res.statusCode).toBe(404);
  });

  it("advances status to scheduled", async () => {
    const { id } = await createAppointment();
    const res = await h.inject({
      method: "PATCH",
      url: `/appointments/${id}/status`,
      headers: adminAuth(),
      payload: { status: "scheduled" },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json<{ status: string }>().status).toBe("scheduled");
  });

  it("cancels an appointment", async () => {
    const { id } = await createAppointment();
    const res = await h.inject({
      method: "PATCH",
      url: `/appointments/${id}/status`,
      headers: adminAuth(),
      payload: { status: "cancelled", cancellationReason: "client_request" },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json<{ status: string; cancellationReason: string }>()).toMatchObject({
      status: "cancelled",
      cancellationReason: "client_request",
    });
  });

  it("deletes an appointment", async () => {
    const { id } = await createAppointment();
    const res = await h.inject({ method: "DELETE", url: `/appointments/${id}`, headers: adminAuth() });
    expect(res.statusCode).toBe(200);
    expect(res.json<{ success: boolean }>().success).toBe(true);
  });

  it("therapist sees their own appointments via GET /me/appointments", async () => {
    const { id } = await createAppointment();
    const res = await h.inject({ method: "GET", url: "/me/appointments", headers: therapistAuth() });
    expect(res.statusCode).toBe(200);
    const { data } = res.json<{ data: { id: number }[] }>();
    expect(data.some((a) => a.id === id)).toBe(true);
  });

  it("rejects an overlapping appointment for the same therapist (409)", async () => {
    const slot = { startedAt: "2026-10-01T08:00:00Z", endedAt: "2026-10-01T09:00:00Z" };
    const first = await h.inject({
      method: "POST",
      url: "/appointments",
      headers: adminAuth(),
      payload: { clientId, therapistId, ...slot },
    });
    expect(first.statusCode).toBe(201);

    // Half-open overlap: starts before the first ends, ends after it starts
    const overlap = await h.inject({
      method: "POST",
      url: "/appointments",
      headers: adminAuth(),
      payload: {
        clientId,
        therapistId,
        startedAt: "2026-10-01T08:30:00Z",
        endedAt: "2026-10-01T09:30:00Z",
      },
    });
    expect(overlap.statusCode).toBe(409);
  });

  it("rejects an invalid status transition (422)", async () => {
    // requested → completed skips scheduled/confirmed; only scheduled|cancelled are allowed from requested
    const { id } = await createAppointment();
    const res = await h.inject({
      method: "PATCH",
      url: `/appointments/${id}/status`,
      headers: adminAuth(),
      payload: { status: "completed" },
    });
    expect(res.statusCode).toBe(422);
  });
});
