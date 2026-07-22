import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ADMIN_EMAIL, ADMIN_PASSWORD, createTestApp, type TestApp } from "./helpers/app.ts";

describe("users lifecycle", () => {
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

  it("GET /me returns the current user", async () => {
    const res = await h.inject({ method: "GET", url: "/me", headers: auth() });
    expect(res.statusCode).toBe(200);
    expect(res.json<{ email: string }>().email).toBe(ADMIN_EMAIL);
  });

  it("creates a user", async () => {
    const res = await h.inject({
      method: "POST",
      url: "/users",
      headers: auth(),
      payload: {
        firstName: "New",
        lastName: "User",
        email: "newuser@test.com",
        password: ADMIN_PASSWORD,
        role: "admin",
      },
    });
    expect(res.statusCode).toBe(201);
    expect(res.json<{ email: string }>().email).toBe("newuser@test.com");
  });

  it("lists users", async () => {
    const res = await h.inject({ method: "GET", url: "/users", headers: auth() });
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.json<{ data: unknown[] }>().data)).toBe(true);
  });

  it("finds a user by ID", async () => {
    const createRes = await h.inject({
      method: "POST",
      url: "/users",
      headers: auth(),
      payload: {
        firstName: "Find",
        lastName: "Me",
        email: "findme@test.com",
        password: ADMIN_PASSWORD,
        role: "admin",
      },
    });
    const { id } = createRes.json<{ id: number }>();

    const res = await h.inject({ method: "GET", url: `/users/${id}`, headers: auth() });
    expect(res.statusCode).toBe(200);
  });

  it("returns 404 for a nonexistent user", async () => {
    const res = await h.inject({ method: "GET", url: "/users/999999", headers: auth() });
    expect(res.statusCode).toBe(404);
  });

  it("updates a user's name", async () => {
    const createRes = await h.inject({
      method: "POST",
      url: "/users",
      headers: auth(),
      payload: {
        firstName: "Before",
        lastName: "Update",
        email: "beforeupdate@test.com",
        password: ADMIN_PASSWORD,
        role: "admin",
      },
    });
    const { id } = createRes.json<{ id: number }>();

    const res = await h.inject({
      method: "PATCH",
      url: `/users/${id}`,
      headers: auth(),
      payload: { firstName: "After" },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json<{ firstName: string }>().firstName).toBe("After");
  });

  it("updates a user's role", async () => {
    const createRes = await h.inject({
      method: "POST",
      url: "/users",
      headers: auth(),
      payload: {
        firstName: "Role",
        lastName: "Change",
        email: "rolechange@test.com",
        password: ADMIN_PASSWORD,
        role: "admin",
      },
    });
    const { id } = createRes.json<{ id: number }>();

    const res = await h.inject({
      method: "PATCH",
      url: `/users/${id}/role`,
      headers: auth(),
      payload: { role: "therapist" },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json<{ role: string }>().role).toBe("therapist");
  });

  it("returns 409 when creating a user with a duplicate email", async () => {
    const payload = {
      firstName: "Dup",
      lastName: "Email",
      email: "dupuser@test.com",
      password: ADMIN_PASSWORD,
      role: "admin",
    };
    await h.inject({ method: "POST", url: "/users", headers: auth(), payload });
    const res = await h.inject({ method: "POST", url: "/users", headers: auth(), payload });
    expect(res.statusCode).toBe(409);
  });

  it("soft-deletes a user: hidden by default, visible with deleted=true", async () => {
    const createRes = await h.inject({
      method: "POST",
      url: "/users",
      headers: auth(),
      payload: {
        firstName: "Soft",
        lastName: "Delete",
        email: "softdelete@test.com",
        password: ADMIN_PASSWORD,
        role: "admin",
      },
    });
    const { id } = createRes.json<{ id: number }>();

    const del = await h.inject({ method: "DELETE", url: `/users/${id}`, headers: auth() });
    expect(del.statusCode).toBe(200);
    expect(del.json<{ success: boolean }>().success).toBe(true);

    const hidden = await h.inject({ method: "GET", url: `/users/${id}`, headers: auth() });
    expect(hidden.statusCode).toBe(404);

    const listed = await h.inject({ method: "GET", url: "/users", headers: auth() });
    expect(listed.json<{ data: { id: number }[] }>().data.some((u) => u.id === id)).toBe(false);

    const shown = await h.inject({
      method: "GET",
      url: `/users/${id}?deleted=true`,
      headers: auth(),
    });
    expect(shown.statusCode).toBe(200);
    expect(shown.json<{ deletedAt: string | null }>().deletedAt).not.toBeNull();

    const listedAll = await h.inject({
      method: "GET",
      url: "/users?deleted=all",
      headers: auth(),
    });
    expect(listedAll.json<{ data: { id: number }[] }>().data.some((u) => u.id === id)).toBe(true);
  });

  it("filters the user list by deleted status: active / all / deleted", async () => {
    const activeRes = await h.inject({
      method: "POST",
      url: "/users",
      headers: auth(),
      payload: {
        firstName: "Active",
        lastName: "User",
        email: "activeuser@test.com",
        password: ADMIN_PASSWORD,
        role: "admin",
      },
    });
    const { id: activeId } = activeRes.json<{ id: number }>();

    const deletedRes = await h.inject({
      method: "POST",
      url: "/users",
      headers: auth(),
      payload: {
        firstName: "Deleted",
        lastName: "User",
        email: "deleteduser@test.com",
        password: ADMIN_PASSWORD,
        role: "admin",
      },
    });
    const { id: deletedId } = deletedRes.json<{ id: number }>();
    await h.inject({ method: "DELETE", url: `/users/${deletedId}`, headers: auth() });

    const active = await h.inject({
      method: "GET",
      url: "/users?deleted=active&limit=100",
      headers: auth(),
    });
    const activeIds = active.json<{ data: { id: number }[] }>().data.map((u) => u.id);
    expect(activeIds).toContain(activeId);
    expect(activeIds).not.toContain(deletedId);

    const all = await h.inject({
      method: "GET",
      url: "/users?deleted=all&limit=100",
      headers: auth(),
    });
    const allIds = all.json<{ data: { id: number }[] }>().data.map((u) => u.id);
    expect(allIds).toContain(activeId);
    expect(allIds).toContain(deletedId);

    const deletedOnly = await h.inject({
      method: "GET",
      url: "/users?deleted=deleted&limit=100",
      headers: auth(),
    });
    const deletedIds = deletedOnly.json<{ data: { id: number }[] }>().data.map((u) => u.id);
    expect(deletedIds).toContain(deletedId);
    expect(deletedIds).not.toContain(activeId);
  });

  it("blocks login for a soft-deleted user", async () => {
    const createRes = await h.inject({
      method: "POST",
      url: "/users",
      headers: auth(),
      payload: {
        firstName: "Locked",
        lastName: "Out",
        email: "lockedout@test.com",
        password: ADMIN_PASSWORD,
        role: "admin",
      },
    });
    const { id } = createRes.json<{ id: number }>();

    await h.inject({ method: "DELETE", url: `/users/${id}`, headers: auth() });

    const loginRes = await h.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email: "lockedout@test.com", password: ADMIN_PASSWORD },
    });
    expect(loginRes.statusCode).toBe(401);
  });

  it("cascades a user soft-delete to their linked therapist profile", async () => {
    const createRes = await h.inject({
      method: "POST",
      url: "/therapists",
      headers: auth(),
      payload: {
        firstName: "Cascade",
        lastName: "Therapist",
        email: "cascadetherapist@test.com",
        password: ADMIN_PASSWORD,
        speciality: "orthopedic",
        phone: "+1234567890",
        workingHours: {},
      },
    });
    const { id } = createRes.json<{ id: number }>();

    const del = await h.inject({ method: "DELETE", url: `/users/${id}`, headers: auth() });
    expect(del.statusCode).toBe(200);

    const therapist = await h.inject({
      method: "GET",
      url: `/therapists/${id}?deleted=true`,
      headers: auth(),
    });
    expect(therapist.statusCode).toBe(200);
    expect(therapist.json<{ deletedAt: string | null }>().deletedAt).not.toBeNull();
  });

  it("PATCH /me/password changes the password and allows login with the new one", async () => {
    const createRes = await h.inject({
      method: "POST",
      url: "/users",
      headers: auth(),
      payload: {
        firstName: "Pass",
        lastName: "Change",
        email: "passchange@test.com",
        password: ADMIN_PASSWORD,
        role: "admin",
      },
    });
    expect(createRes.statusCode).toBe(201);

    const { token } = await h.login("passchange@test.com");

    const newPassword = "NewPass5678!";
    const patchRes = await h.inject({
      method: "PATCH",
      url: "/me/password",
      headers: { authorization: `Bearer ${token}` },
      payload: { currentPassword: ADMIN_PASSWORD, newPassword },
    });
    expect(patchRes.statusCode).toBe(200);

    const loginRes = await h.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email: "passchange@test.com", password: newPassword },
    });
    expect(loginRes.statusCode).toBe(200);
  });
});
