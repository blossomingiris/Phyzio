import Type from "typebox";

export const EntityIdParam = Type.Object(
  { id: Type.Integer({ minimum: 1 }) },
  { additionalProperties: false },
);

export const PaginationQueryParams = Type.Object(
  {
    page: Type.Optional(Type.Integer({ minimum: 1, default: 1 })),
    limit: Type.Optional(
      Type.Integer({ minimum: 1, maximum: 100, default: 20 }),
    ),
  },
  { additionalProperties: false },
);

export const PaginationMeta = {
  total: Type.Integer(),
  page: Type.Integer(),
  limit: Type.Integer(),
  totalPages: Type.Integer(),
};
