import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ADMIN_EMAIL, ADMIN_PASSWORD, createTestApp, type TestApp } from "./helpers/app.ts";

describe("clients access control", () => {
  let h: TestApp;
  let adminToken: string;
  let therapistAToken: string;
  let therapistBToken: string;
  let clientOfA: number;

  beforeAll(async () => {
    h = await createTestApp();
    await h.clearAll();
    await h.makeAdmin();
    ({ token: adminToken } = await h.login(ADMIN_EMAIL));

    // Create two therapists
    const a = await h.inject({
      method: "POST",
      url: "/therapists",
      headers: { authorization: `Bearer ${adminToken}` },
      payload: {
        firstName: "Therapist",
        lastName: "A",
        email: "therapist-a@test.com",
        password: ADMIN_PASSWORD,
        speciality: "orthopedic",
        phone: "+1111111111",
        workingHours: {},
      },
    });
    if (a.statusCode !== 201) throw new Error(`therapistA setup failed: ${a.body}`);
    const therapistAId = a.json<{ id: number }>().id;

    const b = await h.inject({
      method: "POST",
      url: "/therapists",
      headers: { authorization: `Bearer ${adminToken}` },
      payload: {
        firstName: "Therapist",
        lastName: "B",
        email: "therapist-b@test.com",
        password: ADMIN_PASSWORD,
        speciality: "sports",
        phone: "+2222222222",
        workingHours: {},
      },
    });
    if (b.statusCode !== 201) throw new Error(`therapistB setup failed: ${b.body}`);

    ({ token: therapistAToken } = await h.login("therapist-a@test.com"));
    ({ token: therapistBToken } = await h.login("therapist-b@test.com"));

    // Create a client assigned to therapist A
    const clientRes = await h.inject({
      method: "POST",
      url: "/clients",
      headers: { authorization: `Bearer ${adminToken}` },
      payload: {
        firstName: "Client",
        lastName: "OfA",
        preferredCommunication: "email",
        therapistId: therapistAId,
      },
    });
    if (clientRes.statusCode !== 201) throw new Error(`client setup failed: ${clientRes.body}`);
    clientOfA = clientRes.json<{ id: number }>().id;
  });

  afterAll(async () => {
    await h.close();
  });

  it("therapist sees their own clients via GET /me/clients", async () => {
    const res = await h.inject({
      method: "GET",
      url: "/me/clients",
      headers: { authorization: `Bearer ${therapistAToken}` },
    });
    expect(res.statusCode).toBe(200);
    const { data } = res.json<{ data: { id: number }[] }>();
    expect(data.some((c) => c.id === clientOfA)).toBe(true);
  });

  it("therapist B cannot see therapist A's client via GET /me/clients/:id", async () => {
    const res = await h.inject({
      method: "GET",
      url: `/me/clients/${clientOfA}`,
      headers: { authorization: `Bearer ${therapistBToken}` },
    });
    expect(res.statusCode).toBe(404);
  });

  it("therapist cannot access admin GET /clients", async () => {
    const res = await h.inject({
      method: "GET",
      url: "/clients",
      headers: { authorization: `Bearer ${therapistAToken}` },
    });
    expect(res.statusCode).toBe(403);
  });

  it("admin sees all clients via GET /clients", async () => {
    const res = await h.inject({
      method: "GET",
      url: "/clients",
      headers: { authorization: `Bearer ${adminToken}` },
    });
    expect(res.statusCode).toBe(200);
    const { data } = res.json<{ data: { id: number }[] }>();
    expect(data.some((c) => c.id === clientOfA)).toBe(true);
  });
});
