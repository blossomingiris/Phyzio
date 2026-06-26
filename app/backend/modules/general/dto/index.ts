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
