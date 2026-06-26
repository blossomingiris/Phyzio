import { specialityEnum } from "#app/database/schemas.ts";
import { paginationMeta, paramId } from "#app/domains/shared/dto/index.ts";
import type { Speciality } from "#app/database/types.ts";
import Type, { type Static } from "typebox";

export const specialitySchema = Type.Unsafe<Speciality>({
  type: "string",
  enum: specialityEnum.enumValues,
});

const timeSlotSchema = Type.Object({
  start: Type.String({ description: "Time in HH:MM format" }),
  end: Type.String({ description: "Time in HH:MM format" }),
});

const workingHoursSchema = Type.Object({
  tue: Type.Optional(Type.Array(timeSlotSchema)),
  wed: Type.Optional(Type.Array(timeSlotSchema)),
  thu: Type.Optional(Type.Array(timeSlotSchema)),
  fri: Type.Optional(Type.Array(timeSlotSchema)),
  sat: Type.Optional(Type.Array(timeSlotSchema)),
  sun: Type.Optional(Type.Array(timeSlotSchema)),
});

const therapistResponse = Type.Object({
  id: Type.Integer(),
  userId: Type.Integer(),
  firstName: Type.String(),
  lastName: Type.String(),
  email: Type.String({ format: "email" }),
  speciality: specialitySchema,
  phone: Type.String(),
  workingHours: workingHoursSchema,
  isActive: Type.Boolean(),
  deletedAt: Type.Optional(Type.String({ format: "date-time" })),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
});

const therapistListResponse = Type.Object({
  data: Type.Array(therapistResponse),
  pagination: Type.Object(paginationMeta),
});

export const adminCreateTherapistBody = Type.Object(
  {
    firstName: Type.String({ minLength: 1, maxLength: 255 }),
    lastName: Type.String({ minLength: 1, maxLength: 255 }),
    email: Type.String({ format: "email", maxLength: 255 }),
    password: Type.String({
      description: "Min 8 chars with uppercase, lowercase, and digit",
      minLength: 8,
      pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$",
    }),
    speciality: specialitySchema,
    phone: Type.String({ minLength: 1, maxLength: 50 }),
    workingHours: workingHoursSchema,
  },
  { additionalProperties: false },
);

export const adminUpdateTherapistBody = Type.Partial(
  Type.Object(
    {
      speciality: specialitySchema,
      phone: Type.String({ minLength: 1, maxLength: 50 }),
      workingHours: workingHoursSchema,
      isActive: Type.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const adminListTherapistsQuery = Type.Object(
  {
    page: Type.Optional(Type.Integer({ minimum: 1, default: 1 })),
    limit: Type.Optional(
      Type.Integer({ minimum: 1, maximum: 100, default: 20 }),
    ),
    search: Type.Optional(Type.String({ description: "Partial match on first or last name" })),
    speciality: Type.Optional(specialitySchema),
    isActive: Type.Optional(Type.Boolean()),
  },
  { additionalProperties: false },
);

export const adminListTherapistsSchema = {
  tags: ["Therapists"],
  summary: "List all therapists",
  querystring: adminListTherapistsQuery,
  response: { 200: therapistListResponse },
};

export const adminFindTherapistSchema = {
  tags: ["Therapists"],
  summary: "Get a therapist by ID",
  params: paramId,
  response: { 200: therapistResponse },
};

export const adminCreateTherapistSchema = {
  tags: ["Therapists"],
  summary: "Create a therapist",
  body: adminCreateTherapistBody,
  response: { 201: therapistResponse },
};

export const adminUpdateTherapistSchema = {
  tags: ["Therapists"],
  summary: "Update therapist profile",
  params: paramId,
  body: adminUpdateTherapistBody,
  response: { 200: therapistResponse },
};

export const adminDeleteTherapistSchema = {
  tags: ["Therapists"],
  summary: "Delete a therapist",
  params: paramId,
  response: { 200: Type.Object({ success: Type.Boolean() }) },
};

export type AdminListTherapistsQuery = Static<typeof adminListTherapistsQuery>;
export type AdminCreateTherapistBody = Static<typeof adminCreateTherapistBody>;
export type AdminUpdateTherapistBody = Static<typeof adminUpdateTherapistBody>;
