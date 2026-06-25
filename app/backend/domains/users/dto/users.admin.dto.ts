import {
  EntityIdParam,
  PaginationMeta,
  PaginationQueryParams,
} from "#app/domains/shared/dto/index.ts";
import Type from "typebox";

const UserRoleSchema = Type.Union([
  Type.Literal("admin"),
  Type.Literal("therapist"),
]);

const UserResponse = Type.Object({
  id: Type.Integer(),
  firstName: Type.String(),
  lastName: Type.String(),
  email: Type.String({ format: "email" }),
  role: UserRoleSchema,
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
});

const UserListResponse = Type.Object({
  data: Type.Array(UserResponse),
  pagination: Type.Object(PaginationMeta),
});

export const AdminCreateUserBody = Type.Object(
  {
    firstName: Type.String({ minLength: 1, maxLength: 255 }),
    lastName: Type.String({ minLength: 1, maxLength: 255 }),
    email: Type.String({ format: "email", maxLength: 255 }),
    password: Type.String({
      description: "Min 8 chars with uppercase, lowercase, and digit",
      example: "Secret123",
      minLength: 8,
      pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$",
    }),
    role: UserRoleSchema,
  },
  { additionalProperties: false },
);

export const AdminUpdateUserBody = Type.Partial(
  Type.Pick(AdminCreateUserBody, ["firstName", "lastName", "email"]),
);

export const AdminUpdateRoleBody = Type.Object(
  { role: UserRoleSchema },
  { additionalProperties: false },
);

export const adminListUsersSchema = {
  tags: ["Users"],
  summary: "List all users",
  querystring: PaginationQueryParams,
  response: { 200: UserListResponse },
};

export const adminFindUserSchema = {
  tags: ["Users"],
  summary: "Get a user by ID",
  params: EntityIdParam,
  response: { 200: UserResponse },
};

export const adminCreateUserSchema = {
  tags: ["Users"],
  summary: "Create a user",
  body: AdminCreateUserBody,
  response: { 201: UserResponse },
};

export const adminUpdateUserSchema = {
  tags: ["Users"],
  summary: "Update user profile",
  params: EntityIdParam,
  body: AdminUpdateUserBody,
  response: { 200: UserResponse },
};

export const adminUpdateRoleSchema = {
  tags: ["Users"],
  summary: "Update user role",
  params: EntityIdParam,
  body: AdminUpdateRoleBody,
  response: { 200: UserResponse },
};
