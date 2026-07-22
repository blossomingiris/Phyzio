import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ADMIN_EMAIL, ADMIN_PASSWORD, createTestApp, type TestApp } from "./helpers/app.ts";

describe("treatment plans lifecycle", () => {
  let h: TestApp;
  let adminToken: string;
  let therapistToken: string;
  let therapistId: number;
  let clientId: number;
  let treatmentId: number;

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
        firstName: "Plan",
        lastName: "Therapist",
        email: "plan-therapist@test.com",
        password: ADMIN_PASSWORD,
        speciality: "orthopedic",
        phone: "+1234567890",
        workingHours: {},
      },
    });
    if (therapistRes.statusCode !== 201) throw new Error(`therapist setup failed: ${therapistRes.body}`);
    therapistId = therapistRes.json<{ id: number }>().id;
    ({ token: therapistToken } = await h.login("plan-therapist@test.com"));

    const clientRes = await h.inject({
      method: "POST",
      url: "/clients",
      headers: { authorization: `Bearer ${adminToken}` },
      payload: {
        firstName: "Plan",
        lastName: "Client",
        preferredCommunication: "email",
        therapistId,
      },
    });
    if (clientRes.statusCode !== 201) throw new Error(`client setup failed: ${clientRes.body}`);
    clientId = clientRes.json<{ id: number }>().id;

    const treatmentRes = await h.inject({
      method: "POST",
      url: "/treatments",
      headers: { authorization: `Bearer ${adminToken}` },
      payload: { name: "Standard Session", category: "ortho_sports", pricePerUnit: "100.00", quantity: 10, durationMinutes: 60 },
    });
    if (treatmentRes.statusCode !== 201) throw new Error(`treatment setup failed: ${treatmentRes.body}`);
    treatmentId = treatmentRes.json<{ id: number }>().id;
  });

  afterAll(async () => {
    await h.close();
  });

  const therapistAuth = () => ({ authorization: `Bearer ${therapistToken}` });
  const adminAuth = () => ({ authorization: `Bearer ${adminToken}` });

  let slotIndex = 0;
  function nextSlot() {
    const base = new Date("2026-09-01T08:00:00Z");
    base.setHours(base.getHours() + slotIndex++);
    const end = new Date(base);
    end.setHours(end.getHours() + 1);
    return { startedAt: base.toISOString(), endedAt: end.toISOString() };
  }

  async function advanceAppointmentTo(id: number, status: string) {
    const res = await h.inject({
      method: "PATCH",
      url: `/appointments/${id}/status`,
      headers: adminAuth(),
      payload: { status },
    });
    if (res.statusCode !== 200) throw new Error(`advance appointment to ${status} failed: ${res.body}`);
  }

  async function createPlan() {
    const res = await h.inject({
      method: "POST",
      url: "/me/treatment-plans",
      headers: therapistAuth(),
      payload: {
        clientId,
        primaryDiagnostic: "Lower back pain",
        clinicalGoals: "Restore mobility",
        startDate: new Date().toISOString(),
        items: [{ treatmentId }],
      },
    });
    if (res.statusCode !== 201) throw new Error(`createPlan failed: ${res.body}`);
    return res.json<{ id: number; status: string }>();
  }

  it("therapist creates a treatment plan", async () => {
    const res = await h.inject({
      method: "POST",
      url: "/me/treatment-plans",
      headers: therapistAuth(),
      payload: {
        clientId,
        primaryDiagnostic: "Lower back pain",
        clinicalGoals: "Restore mobility",
        startDate: new Date().toISOString(),
        items: [{ treatmentId }],
      },
    });
    expect(res.statusCode).toBe(201);
    const body = res.json<{ status: string; items: unknown[] }>();
    expect(body.status).toBe("open");
    expect(body.items).toHaveLength(1);
  });

  it("lists treatment plans for the therapist", async () => {
    const res = await h.inject({ method: "GET", url: "/me/treatment-plans", headers: therapistAuth() });
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.json<{ data: unknown[] }>().data)).toBe(true);
  });

  it("admin lists all treatment plans", async () => {
    const res = await h.inject({ method: "GET", url: "/treatment-plans", headers: adminAuth() });
    expect(res.statusCode).toBe(200);
  });

  it("includes items with treatment progress in the list response, grouped correctly per plan", async () => {
    const treatment2Res = await h.inject({
      method: "POST",
      url: "/treatments",
      headers: adminAuth(),
      payload: { name: "Vestibular Therapy", category: "neuro_vestibular", pricePerUnit: "50.00", quantity: 5, durationMinutes: 30 },
    });
    if (treatment2Res.statusCode !== 201) throw new Error(`treatment2 setup failed: ${treatment2Res.body}`);
    const treatment2Id = treatment2Res.json<{ id: number }>().id;

    const planARes = await h.inject({
      method: "POST",
      url: "/me/treatment-plans",
      headers: therapistAuth(),
      payload: {
        clientId,
        primaryDiagnostic: "Plan A diagnostic",
        clinicalGoals: "Goal A",
        startDate: new Date().toISOString(),
        items: [{ treatmentId }],
      },
    });
    if (planARes.statusCode !== 201) throw new Error(`planA setup failed: ${planARes.body}`);
    const planAId = planARes.json<{ id: number }>().id;

    const planBRes = await h.inject({
      method: "POST",
      url: "/me/treatment-plans",
      headers: therapistAuth(),
      payload: {
        clientId,
        primaryDiagnostic: "Plan B diagnostic",
        clinicalGoals: "Goal B",
        startDate: new Date().toISOString(),
        items: [{ treatmentId: treatment2Id }],
      },
    });
    if (planBRes.statusCode !== 201) throw new Error(`planB setup failed: ${planBRes.body}`);
    const planBId = planBRes.json<{ id: number }>().id;

    const listRes = await h.inject({
      method: "GET",
      url: `/treatment-plans?clientId=${clientId}&limit=100`,
      headers: adminAuth(),
    });
    expect(listRes.statusCode).toBe(200);
    const body = listRes.json<{
      data: {
        id: number;
        primaryDiagnostic: string;
        items: { treatment: { id: number; quantity: number }; quantityCompleted: number }[];
      }[];
    }>();

    const planA = body.data.find((p) => p.id === planAId);
    const planB = body.data.find((p) => p.id === planBId);
    expect(planA).toBeDefined();
    expect(planB).toBeDefined();

    expect(planA!.items).toHaveLength(1);
    expect(planA!.items[0]!.treatment.id).toBe(treatmentId);
    expect(planA!.items[0]!.treatment.quantity).toBe(10);
    expect(planA!.items[0]!.quantityCompleted).toBe(0);

    expect(planB!.items).toHaveLength(1);
    expect(planB!.items[0]!.treatment.id).toBe(treatment2Id);
    expect(planB!.items[0]!.treatment.quantity).toBe(5);
  });

  it("completing an appointment auto-advances plan open → in_progress, then therapist can pause", async () => {
    const { id: planId } = await createPlan();

    // Create an appointment linked to the plan
    const apptRes = await h.inject({
      method: "POST",
      url: "/appointments",
      headers: adminAuth(),
      payload: { clientId, therapistId, treatmentPlanId: planId, ...nextSlot() },
    });
    if (apptRes.statusCode !== 201) throw new Error(`createAppointment failed: ${apptRes.body}`);
    const apptId = apptRes.json<{ id: number }>().id;

    // requested → scheduled → confirmed → completed (auto-advances plan to in_progress)
    await advanceAppointmentTo(apptId, "scheduled");
    await advanceAppointmentTo(apptId, "confirmed");
    await advanceAppointmentTo(apptId, "completed");

    // Verify plan is now in_progress
    const planRes = await h.inject({
      method: "GET",
      url: `/me/treatment-plans/${planId}`,
      headers: therapistAuth(),
    });
    expect(planRes.statusCode).toBe(200);
    expect(planRes.json<{ status: string }>().status).toBe("in_progress");

    // Now therapist can pause
    const pauseRes = await h.inject({
      method: "PATCH",
      url: `/me/treatment-plans/${planId}/status`,
      headers: therapistAuth(),
      payload: { status: "paused" },
    });
    expect(pauseRes.statusCode).toBe(200);
    expect(pauseRes.json<{ status: string }>().status).toBe("paused");
  });

  it("rejects an invalid manual transition from open (422)", async () => {
    // A fresh plan is 'open'; the only manual move is → cancelled. open → paused must be rejected.
    const { id } = await createPlan();
    const res = await h.inject({
      method: "PATCH",
      url: `/me/treatment-plans/${id}/status`,
      headers: therapistAuth(),
      payload: { status: "paused" },
    });
    expect(res.statusCode).toBe(422);
  });

  it("admin cancels a plan", async () => {
    const { id } = await createPlan();
    const res = await h.inject({
      method: "PATCH",
      url: `/treatment-plans/${id}/status`,
      headers: adminAuth(),
      payload: { status: "cancelled", cancellationReason: "client_request" },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json<{ status: string; cancellationReason: string }>()).toMatchObject({
      status: "cancelled",
      cancellationReason: "client_request",
    });
  });

  it("admin searches plans by ID, client name, and therapist name", async () => {
    const { id: planId } = await createPlan();

    const byId = await h.inject({
      method: "GET",
      url: `/treatment-plans?search=${planId}`,
      headers: adminAuth(),
    });
    expect(byId.statusCode).toBe(200);
    expect(byId.json<{ data: { id: number }[] }>().data.map((p) => p.id)).toContain(planId);

    const byClientName = await h.inject({
      method: "GET",
      url: `/treatment-plans?search=${encodeURIComponent("Plan Client")}&limit=100`,
      headers: adminAuth(),
    });
    expect(byClientName.statusCode).toBe(200);
    expect(
      byClientName.json<{ data: { id: number }[] }>().data.map((p) => p.id),
    ).toContain(planId);

    const byTherapistName = await h.inject({
      method: "GET",
      url: `/treatment-plans?search=${encodeURIComponent("Plan Therapist")}&limit=100`,
      headers: adminAuth(),
    });
    expect(byTherapistName.statusCode).toBe(200);
    expect(
      byTherapistName.json<{ data: { id: number }[] }>().data.map((p) => p.id),
    ).toContain(planId);

    const noMatch = await h.inject({
      method: "GET",
      url: "/treatment-plans?search=NoSuchPersonXYZ",
      headers: adminAuth(),
    });
    expect(noMatch.statusCode).toBe(200);
    expect(noMatch.json<{ data: unknown[] }>().data).toHaveLength(0);
  });

  it("therapist cannot see another therapist's plan", async () => {
    const { id } = await createPlan();
    await h.inject({
      method: "POST",
      url: "/therapists",
      headers: adminAuth(),
      payload: {
        firstName: "Other",
        lastName: "Therapist",
        email: "other-therapist@test.com",
        password: ADMIN_PASSWORD,
        speciality: "sports",
        phone: "+9999999999",
        workingHours: {},
      },
    });
    const { token: otherToken } = await h.login("other-therapist@test.com");

    const res = await h.inject({
      method: "GET",
      url: `/me/treatment-plans/${id}`,
      headers: { authorization: `Bearer ${otherToken}` },
    });
    expect(res.statusCode).toBe(404);
  });
});
