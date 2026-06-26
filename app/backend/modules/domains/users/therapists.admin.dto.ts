import { specialityEnum } from "#app/database/schemas.ts";
import type { Speciality } from "#app/database/types.ts";
import {
  paginationMeta,
  paramId,
  sortOrderSchema,
  sortParamsSchema,
} from "#app/modules/general/dto/index.ts";
import Type, { type Static } from "typebox";

export type TherapistSortBy = "createdAt" | "lastName" | "email";

export const specialitySchema = Type.Unsafe<Speciality>({
  type: "string",
  enum: specialityEnum.enumValues,
});

const therapistSortBySchema = Type.Optional(
  Type.Unsafe<TherapistSortBy>({
    type: "string",
    enum: ["createdAt", "lastName", "email"],
    default: "createdAt",
  }),
);

const timeSlotSchema = Type.Object({
  start: Type.String({ description: "Time in HH:MM format" }),
  end: Type.String({ description: "Time in HH:MM format" }),
});

const workingHoursSchema = Type.Object({
  mon: Type.Optional(Type.Array(timeSlotSchema)),
  tue: Type.Optional(Type.Array(timeSlotSchema)),
  wed: Type.Optional(Type.Array(timeSlotSchema)),
  thu: Type.Optional(Type.Array(timeSlotSchema)),
  fri: Type.Optional(Type.Array(timeSlotSchema)),
  sat: Type.Optional(Type.Array(timeSlotSchema)),
  sun: Type.Optional(Type.Array(timeSlotSchema)),
});

const therapistResponse = Type.Object({
  id: Type.Integer(),
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

export const createTherapistBody = Type.Object(
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

export const updateTherapistBody = Type.Partial(
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

export const listTherapistsQuery = Type.Object(
  {
    page: Type.Optional(Type.Integer({ minimum: 1, default: 1 })),
    limit: Type.Optional(
      Type.Integer({ minimum: 1, maximum: 100, default: 20 }),
    ),
    search: Type.Optional(
      Type.String({ description: "Partial match on first or last name" }),
    ),
    speciality: Type.Optional(specialitySchema),
    isActive: Type.Optional(Type.Boolean()),
    sortBy: therapistSortBySchema,
    sortOrder: sortOrderSchema,
  },
  { additionalProperties: false },
);

export const listTherapistsSchema = {
  tags: ["Therapists"],
  summary: "List all therapists",
  querystring: listTherapistsQuery,
  response: { 200: therapistListResponse },
};

export const findTherapistSchema = {
  tags: ["Therapists"],
  summary: "Get a therapist by ID",
  params: paramId,
  response: { 200: therapistResponse },
};

export const createTherapistSchema = {
  tags: ["Therapists"],
  summary: "Create a therapist",
  body: createTherapistBody,
  response: { 201: therapistResponse },
};

export const updateTherapistSchema = {
  tags: ["Therapists"],
  summary: "Update therapist profile",
  params: paramId,
  body: updateTherapistBody,
  response: { 200: therapistResponse },
};

export const deleteTherapistSchema = {
  tags: ["Therapists"],
  summary: "Delete a therapist",
  params: paramId,
  response: { 200: Type.Object({ success: Type.Boolean() }) },
};

export type ListTherapistsQuery = Static<typeof listTherapistsQuery>;
export type CreateTherapistBody = Static<typeof createTherapistBody>;
export type UpdateTherapistBody = Static<typeof updateTherapistBody>;
const therapistSortParamsSchema = sortParamsSchema(therapistSortBySchema);
export type TherapistSortParams = Static<typeof therapistSortParamsSchema>;
