import { userRoleEnum } from "#app/database/schemas.ts";
import type { UserRole } from "#app/database/types.ts";
import {
  errorResponse,
  paginationMeta,
  paramId,
  sortOrderSchema,
  sortParamsSchema,
  fieldErrorResponse,
} from "#app/modules/general/dto/index.ts";
import Type, { type Static } from "typebox";

export const userRoleSchema = Type.Unsafe<UserRole>({
  type: "string",
  enum: userRoleEnum.enumValues,
});

export type UserSortBy = "createdAt" | "lastName" | "email";

const userSortBySchema = Type.Optional(
  Type.Unsafe<UserSortBy>({
    type: "string",
    enum: ["createdAt", "lastName", "email"],
    default: "createdAt",
  }),
);

export const userResponse = Type.Object({
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

export const createUserBody = Type.Object(
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

export const updateUserBody = Type.Partial(
  Type.Pick(createUserBody, ["firstName", "lastName", "email"]),
);

export const updateRoleBody = Type.Object(
  { role: userRoleSchema },
  { additionalProperties: false },
);

export const listUsersQuery = Type.Object(
  {
    page: Type.Optional(Type.Integer({ minimum: 1, default: 1 })),
    limit: Type.Optional(
      Type.Integer({ minimum: 1, maximum: 100, default: 20 }),
    ),
    search: Type.Optional(
      Type.String({ description: "Partial match on first or last name" }),
    ),
    role: Type.Optional(userRoleSchema),
    sortBy: userSortBySchema,
    sortOrder: sortOrderSchema,
  },
  { additionalProperties: false },
);

export const listUsersSchema = {
  tags: ["Users"],
  summary: "List all users",
  querystring: listUsersQuery,
  response: {
    200: userListResponse,
    400: fieldErrorResponse,
    401: errorResponse,
    403: errorResponse,
  },
};

export const findUserSchema = {
  tags: ["Users"],
  summary: "Get a user by ID",
  params: paramId,
  response: {
    200: userResponse,
    400: fieldErrorResponse,
    401: errorResponse,
    403: errorResponse,
    404: errorResponse,
  },
};

export const createUserSchema = {
  tags: ["Users"],
  summary: "Create a user",
  body: createUserBody,
  response: {
    201: userResponse,
    400: fieldErrorResponse,
    401: errorResponse,
    403: errorResponse,
    409: errorResponse,
  },
};

export const updateUserSchema = {
  tags: ["Users"],
  summary: "Update user profile",
  params: paramId,
  body: updateUserBody,
  response: {
    200: userResponse,
    400: fieldErrorResponse,
    401: errorResponse,
    403: errorResponse,
    404: errorResponse,
    409: errorResponse,
  },
};

export const updateRoleSchema = {
  tags: ["Users"],
  summary: "Update user role",
  params: paramId,
  body: updateRoleBody,
  response: {
    200: userResponse,
    400: fieldErrorResponse,
    401: errorResponse,
    403: errorResponse,
    404: errorResponse,
  },
};

export type ListUsersQuery = Static<typeof listUsersQuery>;
export type CreateUserBody = Static<typeof createUserBody>;
export type UpdateUserBody = Static<typeof updateUserBody>;
export type UpdateRoleBody = Static<typeof updateRoleBody>;
const userSortParamsSchema = sortParamsSchema(userSortBySchema);
export type UserSortParams = Static<typeof userSortParamsSchema>;
