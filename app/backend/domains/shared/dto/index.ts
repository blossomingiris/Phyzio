import Type from "typebox";

export const TimestampFields = Type.Object({
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
});

export const ResourceIdParam = Type.Object({
  id: Type.Integer({ minimum: 1 }),
});

export const PaginationQuery = Type.Object({
  page: Type.Optional(Type.Integer({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100, default: 20 })),
});
