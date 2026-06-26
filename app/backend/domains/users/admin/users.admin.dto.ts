import { userRoleEnum } from "#app/database/schemas.ts";
import type { UserRole } from "#app/database/types.ts";
import { paginationMeta, paramId } from "#app/domains/shared/dto/index.ts";
import Type, { type Static } from "typebox";

const userRoleSchema = Type.Unsafe<UserRole>({
  type: "string",
  enum: userRoleEnum.enumValues,
});

const userResponse = Type.Object({
  id: Type.Integer(),
  firstName: Type.String(),
  lastName: Type.String(),
  email: Type.String({ format: "email" }),
  role: userRoleSchema,
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
});

const userListResponse = Type.Object({
  data: Type.Array(userResponse),
  pagination: Type.Object(paginationMeta),
});

export const adminCreateUserBody = Type.Object(
  {
    firstName: Type.String({ minLength: 1, maxLength: 255 }),
    lastName: Type.String({ minLength: 1, maxLength: 255 }),
    email: Type.String({ format: "email", maxLength: 255 }),
    password: Type.String({
      description: "Min 8 chars with uppercase, lowercase, and digit",
      minLength: 8,
      pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$",
    }),
    role: userRoleSchema,
  },
  { additionalProperties: false },
);

export const adminUpdateUserBody = Type.Partial(
  Type.Pick(adminCreateUserBody, ["firstName", "lastName", "email"]),
);

export const adminUpdateRoleBody = Type.Object(
  { role: userRoleSchema },
  { additionalProperties: false },
);

export const adminListUsersQuery = Type.Object(
  {
    page: Type.Optional(Type.Integer({ minimum: 1, default: 1 })),
    limit: Type.Optional(
      Type.Integer({ minimum: 1, maximum: 100, default: 20 }),
    ),
    search: Type.Optional(Type.String({ description: "Partial match on first or last name" })),
    role: Type.Optional(userRoleSchema),
  },
  { additionalProperties: false },
);

export const adminListUsersSchema = {
  tags: ["Users"],
  summary: "List all users",
  querystring: adminListUsersQuery,
  response: { 200: userListResponse },
};

export const adminFindUserSchema = {
  tags: ["Users"],
  summary: "Get a user by ID",
  params: paramId,
  response: { 200: userResponse },
};

export const adminCreateUserSchema = {
  tags: ["Users"],
  summary: "Create a user",
  body: adminCreateUserBody,
  response: { 201: userResponse },
};

export const adminUpdateUserSchema = {
  tags: ["Users"],
  summary: "Update user profile",
  params: paramId,
  body: adminUpdateUserBody,
  response: { 200: userResponse },
};

export const adminUpdateRoleSchema = {
  tags: ["Users"],
  summary: "Update user role",
  params: paramId,
  body: adminUpdateRoleBody,
  response: { 200: userResponse },
};

export type AdminListUsersQuery = Static<typeof adminListUsersQuery>;
export type AdminCreateUserBody = Static<typeof adminCreateUserBody>;
export type AdminUpdateUserBody = Static<typeof adminUpdateUserBody>;
export type AdminUpdateRoleBody = Static<typeof adminUpdateRoleBody>;
