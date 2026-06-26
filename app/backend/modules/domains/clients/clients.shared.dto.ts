import {
  communicationEnum,
  originEnum,
  specialityEnum,
} from "#app/database/schemas.ts";
import type {
  ClientCommunication,
  ClientOrigin,
  Speciality,
} from "#app/database/types.ts";
import {
  paginationMeta,
  sortParamsSchema,
} from "#app/modules/general/dto/index.ts";
import Type, { type Static } from "typebox";

export const originSchema = Type.Unsafe<ClientOrigin>({
  type: "string",
  enum: originEnum.enumValues,
});

export const communicationSchema = Type.Unsafe<ClientCommunication>({
  type: "string",
  enum: communicationEnum.enumValues,
});

const specialitySchema = Type.Unsafe<Speciality>({
  type: "string",
  enum: specialityEnum.enumValues,
});

export const therapistSummarySchema = Type.Object({
  id: Type.Integer(),
  firstName: Type.String(),
  lastName: Type.String(),
  speciality: specialitySchema,
  phone: Type.String(),
  email: Type.String({ format: "email" }),
  isActive: Type.Boolean(),
});

export const clientResponse = Type.Object({
  id: Type.Integer(),
  therapist: Type.Union([therapistSummarySchema, Type.Null()]),
  firstName: Type.String(),
  lastName: Type.String(),
  birthDate: Type.Union([Type.String({ format: "date" }), Type.Null()]),
  phone: Type.Union([Type.String(), Type.Null()]),
  email: Type.Union([Type.String({ format: "email" }), Type.Null()]),
  origin: Type.Union([originSchema, Type.Null()]),
  preferredCommunication: communicationSchema,
  medicalNotes: Type.Union([Type.String(), Type.Null()]),
  deletedAt: Type.Optional(Type.String({ format: "date-time" })),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
});

export const clientListResponse = Type.Object({
  data: Type.Array(clientResponse),
  pagination: Type.Object(paginationMeta),
});

export type ClientSortBy = "createdAt" | "lastName";

export const clientSortBySchema = Type.Optional(
  Type.Unsafe<ClientSortBy>({
    type: "string",
    enum: ["createdAt", "lastName"],
    default: "createdAt",
  }),
);

export const clientBaseBody = Type.Object(
  {
    firstName: Type.String({ minLength: 1, maxLength: 255 }),
    lastName: Type.String({ minLength: 1, maxLength: 255 }),
    birthDate: Type.Optional(Type.String({ format: "date" })),
    phone: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
    email: Type.Optional(Type.String({ format: "email", maxLength: 255 })),
    origin: Type.Optional(originSchema),
    preferredCommunication: Type.Optional(communicationSchema),
    medicalNotes: Type.Optional(Type.String()),
  },
  { additionalProperties: false },
);

const clientSortParamsSchema = sortParamsSchema(clientSortBySchema);
export type ClientSortParams = Static<typeof clientSortParamsSchema>;
