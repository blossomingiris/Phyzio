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
