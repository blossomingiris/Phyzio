import {
  errorResponse,
  validationErrorResponse,
} from "#app/modules/general/dto/index.ts";
import Type, { type Static } from "typebox";
import {
  specialitySchema,
  workingHoursSchema,
} from "./therapists.admin.dto.ts";
import { userRoleSchema } from "./users.admin.dto.ts";

const therapistProfileSchema = Type.Object({
  speciality: specialitySchema,
  phone: Type.String(),
  workingHours: workingHoursSchema,
  isActive: Type.Boolean(),
});

export const meResponse = Type.Object({
  id: Type.Integer(),
  firstName: Type.String(),
  lastName: Type.String(),
  email: Type.String({ format: "email" }),
  role: userRoleSchema,
  therapist: Type.Optional(therapistProfileSchema),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
});

export const updateMeBody = Type.Object(
  {
    firstName: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
    lastName: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
    email: Type.Optional(Type.String({ format: "email", maxLength: 255 })),
    phone: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
    workingHours: Type.Optional(workingHoursSchema),
  },
  { additionalProperties: false },
);

export const updateMePasswordBody = Type.Object(
  {
    currentPassword: Type.String({ minLength: 1 }),
    newPassword: Type.String({
      description: "Min 8 chars with uppercase, lowercase, and digit",
      minLength: 8,
      pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$",
    }),
  },
  { additionalProperties: false },
);

export const getMeSchema = {
  tags: ["Me"],
  summary: "Get own profile",
  response: {
    200: meResponse,
    401: errorResponse,
  },
};

export const updateMeSchema = {
  tags: ["Me"],
  summary: "Update own profile",
  body: updateMeBody,
  response: {
    200: meResponse,
    400: validationErrorResponse,
    401: errorResponse,
    409: errorResponse,
  },
};

export const updateMePasswordSchema = {
  tags: ["Me"],
  summary: "Change own password",
  body: updateMePasswordBody,
  response: {
    200: meResponse,
    400: validationErrorResponse,
    401: errorResponse,
  },
};

export type UpdateMeBody = Static<typeof updateMeBody>;
export type UpdateMePasswordBody = Static<typeof updateMePasswordBody>;
