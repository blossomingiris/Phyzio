import {
  errorResponse,
  fieldErrorResponse,
  paginationMeta,
  paramId,
  sortOrderSchema,
  therapistSummarySchema,
} from "#app/modules/general/dto/index.ts";
import Type, { type Static } from "typebox";

import {
  clientBaseBody,
  clientBaseResponse,
  clientSortBySchema,
  communicationSchema,
  originSchema,
} from "#app/modules/domains/clients/clients.shared.dto.ts";

export const clientResponse = Type.Object({
  ...clientBaseResponse.properties,
  therapist: Type.Union([therapistSummarySchema, Type.Null()]),
  deletedAt: Type.Optional(Type.String({ format: "date-time" })),
});

export const clientListResponse = Type.Object({
  data: Type.Array(clientResponse),
  pagination: Type.Object(paginationMeta),
});

export const listClientsQuery = Type.Object(
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
    therapistId: Type.Optional(Type.Integer({ minimum: 1 })),
    deleted: Type.Optional(
      Type.Boolean({
        default: false,
        description: "Include soft-deleted clients",
      }),
    ),
    sortBy: clientSortBySchema,
    sortOrder: sortOrderSchema,
  },
  { additionalProperties: false },
);

export const findClientQuery = Type.Object(
  {
    deleted: Type.Optional(
      Type.Boolean({
        default: false,
        description: "Allow fetching a soft-deleted client",
      }),
    ),
  },
  { additionalProperties: false },
);

export const createClientBody = Type.Object(
  {
    ...clientBaseBody.properties,
    origin: Type.Optional(originSchema),
    preferredCommunication: Type.Optional(communicationSchema),
    therapistId: Type.Optional(Type.Integer({ minimum: 1 })),
  },
  { additionalProperties: false },
);

export const updateClientBody = Type.Partial(createClientBody);

const tag = { tags: ["Admin / Clients"] as const };

export const listClientsSchema = {
  ...tag,
  summary: "List all clients",
  querystring: listClientsQuery,
  response: {
    200: clientListResponse,
    400: fieldErrorResponse,
    401: errorResponse,
    403: errorResponse,
  },
};

export const findClientSchema = {
  ...tag,
  summary: "Get a client by ID",
  params: paramId,
  querystring: findClientQuery,
  response: {
    200: clientResponse,
    400: fieldErrorResponse,
    401: errorResponse,
    403: errorResponse,
    404: errorResponse,
  },
};

export const createClientSchema = {
  ...tag,
  summary: "Create a client",
  body: createClientBody,
  response: {
    201: clientResponse,
    400: fieldErrorResponse,
    401: errorResponse,
    403: errorResponse,
    409: errorResponse,
    422: fieldErrorResponse,
  },
};

export const updateClientSchema = {
  ...tag,
  summary: "Update a client",
  params: paramId,
  body: updateClientBody,
  response: {
    200: clientResponse,
    400: fieldErrorResponse,
    401: errorResponse,
    403: errorResponse,
    404: errorResponse,
    409: errorResponse,
    422: fieldErrorResponse,
  },
};

export const deleteClientSchema = {
  ...tag,
  summary: "Delete a client",
  params: paramId,
  response: {
    200: Type.Object({ success: Type.Boolean() }),
    400: fieldErrorResponse,
    401: errorResponse,
    403: errorResponse,
    404: errorResponse,
  },
};

export type ListClientsQuery = Static<typeof listClientsQuery>;
export type FindClientQuery = Static<typeof findClientQuery>;
export type CreateClientBody = Static<typeof createClientBody>;
export type UpdateClientBody = Static<typeof updateClientBody>;
