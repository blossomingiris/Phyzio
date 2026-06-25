import {
  EntityIdParam,
  PaginationMeta,
  PaginationQueryParams,
} from "#app/domains/shared/dto/index.ts";
import Type from "typebox";

const SpecialitySchema = Type.Union([
  Type.Literal("orthopedic"),
  Type.Literal("sports"),
  Type.Literal("neurology"),
  Type.Literal("pediatric"),
  Type.Literal("geriatric"),
  Type.Literal("cardio_pulmonary"),
  Type.Literal("pelvic_floor"),
  Type.Literal("oncology"),
  Type.Literal("vestibular"),
]);

const TimeSlotSchema = Type.Object({
  start: Type.String({ description: "Time in HH:MM format", example: "09:00" }),
  end: Type.String({ description: "Time in HH:MM format", example: "17:00" }),
});

const WorkingHoursSchema = Type.Object({
  mon: Type.Optional(Type.Array(TimeSlotSchema)),
  tue: Type.Optional(Type.Array(TimeSlotSchema)),
  wed: Type.Optional(Type.Array(TimeSlotSchema)),
  thu: Type.Optional(Type.Array(TimeSlotSchema)),
  fri: Type.Optional(Type.Array(TimeSlotSchema)),
  sat: Type.Optional(Type.Array(TimeSlotSchema)),
  sun: Type.Optional(Type.Array(TimeSlotSchema)),
});

const TherapistResponse = Type.Object({
  id: Type.Integer(),
  userId: Type.Integer(),
  firstName: Type.String(),
  lastName: Type.String(),
  email: Type.String({ format: "email" }),
  speciality: SpecialitySchema,
  phone: Type.String(),
  workingHours: WorkingHoursSchema,
  isActive: Type.Boolean(),
  deletedAt: Type.Union([Type.String({ format: "date-time" }), Type.Null()]),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
});

const TherapistListResponse = Type.Object({
  data: Type.Array(TherapistResponse),
  pagination: Type.Object(PaginationMeta),
});

export const AdminCreateTherapistBody = Type.Object(
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
    speciality: SpecialitySchema,
    phone: Type.String({ minLength: 1, maxLength: 50 }),
    workingHours: WorkingHoursSchema,
  },
  { additionalProperties: false },
);

export const AdminUpdateTherapistBody = Type.Partial(
  Type.Object(
    {
      speciality: SpecialitySchema,
      phone: Type.String({ minLength: 1, maxLength: 50 }),
      workingHours: WorkingHoursSchema,
      isActive: Type.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const adminListTherapistsSchema = {
  tags: ["Therapists"],
  summary: "List all therapists",
  querystring: PaginationQueryParams,
  response: { 200: TherapistListResponse },
};

export const adminFindTherapistSchema = {
  tags: ["Therapists"],
  summary: "Get a therapist by ID",
  params: EntityIdParam,
  response: { 200: TherapistResponse },
};

export const adminCreateTherapistSchema = {
  tags: ["Therapists"],
  summary: "Create a therapist",
  body: AdminCreateTherapistBody,
  response: { 201: TherapistResponse },
};

export const adminUpdateTherapistSchema = {
  tags: ["Therapists"],
  summary: "Update therapist profile",
  params: EntityIdParam,
  body: AdminUpdateTherapistBody,
  response: { 200: TherapistResponse },
};

export const adminDeleteTherapistSchema = {
  tags: ["Therapists"],
  summary: "Delete a therapist",
  params: EntityIdParam,
  response: { 200: Type.Object({ success: Type.Boolean() }) },
};
