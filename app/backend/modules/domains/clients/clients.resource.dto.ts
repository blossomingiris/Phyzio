import {
  errorResponse,
  paramId,
  paginationMeta,
  sortOrderSchema,
  fieldErrorResponse,
} from "#app/modules/general/dto/index.ts";
import Type, { type Static } from "typebox";

import {
  clientBaseBody,
  clientBaseResponse,
  clientSortBySchema,
} from "#app/modules/domains/clients/clients.shared.dto.ts";

export const myClientListResponse = Type.Object({
  data: Type.Array(clientBaseResponse),
  pagination: Type.Object(paginationMeta),
});

export const listMyClientsQuery = Type.Object(
  {
    page: Type.Optional(Type.Integer({ minimum: 1, default: 1 })),
    limit: Type.Optional(
      Type.Integer({ minimum: 1, maximum: 100, default: 20 }),
    ),
    search: Type.Optional(
      Type.String({
        description: "Partial match on first name, last name, or phone",
      }),
    ),
    sortBy: clientSortBySchema,
    sortOrder: sortOrderSchema,
  },
  { additionalProperties: false },
);

export const updateMyClientBody = Type.Partial(clientBaseBody);

const tag = { tags: ["Me / Clients"] as const };

export const listMyClientsSchema = {
  ...tag,
  summary: "List my clients",
  querystring: listMyClientsQuery,
  response: {
    200: myClientListResponse,
    400: fieldErrorResponse,
    401: errorResponse,
  },
};

export const findMyClientSchema = {
  ...tag,
  summary: "Get one of my clients by ID",
  params: paramId,
  response: {
    200: clientBaseResponse,
    400: fieldErrorResponse,
    401: errorResponse,
    404: errorResponse,
  },
};

export const updateMyClientSchema = {
  ...tag,
  summary: "Update one of my clients",
  params: paramId,
  body: updateMyClientBody,
  response: {
    200: clientBaseResponse,
    400: fieldErrorResponse,
    401: errorResponse,
    404: errorResponse,
  },
};

export type ListMyClientsQuery = Static<typeof listMyClientsQuery>;
export type UpdateMyClientBody = Static<typeof updateMyClientBody>;
