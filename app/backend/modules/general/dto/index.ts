import { communicationEnum, specialityEnum } from "#app/database/schemas.ts";
import type { ClientCommunication, Speciality } from "#app/database/types.ts";
import Type, { type Static, type TSchema } from "typebox";

export const paramId = Type.Object(
  { id: Type.Integer({ minimum: 1 }) },
  { additionalProperties: false },
);

export const paginationQueryParams = Type.Object(
  {
    page: Type.Optional(Type.Integer({ minimum: 1, default: 1 })),
    limit: Type.Optional(
      Type.Integer({ minimum: 1, maximum: 100, default: 20 }),
    ),
  },
  { additionalProperties: false },
);

export const paginationMeta = {
  total: Type.Integer(),
  page: Type.Integer(),
  limit: Type.Integer(),
  totalPages: Type.Integer(),
};

export const sortOrderSchema = Type.Optional(
  Type.Unsafe<"asc" | "desc">({
    type: "string",
    enum: ["asc", "desc"],
    default: "desc",
    description: "Sort direction",
  }),
);

export const sortParamsSchema = <T extends TSchema>(dataSchema: T) =>
  Type.Object(
    {
      sortBy: dataSchema,
      sortOrder: sortOrderSchema,
    },
    { additionalProperties: false },
  );

export type ParamId = Static<typeof paramId>;
export type Pagination = Static<typeof paginationQueryParams>;

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

const communicationSchema = Type.Unsafe<ClientCommunication>({
  type: "string",
  enum: communicationEnum.enumValues,
});

export const clientSummarySchema = Type.Object({
  id: Type.Integer(),
  firstName: Type.String(),
  lastName: Type.String(),
  birthDate: Type.Union([Type.String({ format: "date" }), Type.Null()]),
  phone: Type.Union([Type.String(), Type.Null()]),
  email: Type.Union([Type.String({ format: "email" }), Type.Null()]),
  preferredCommunication: communicationSchema,
});

