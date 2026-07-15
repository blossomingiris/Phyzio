import type { ApiPaths, ApiSchemas } from "./generated";

export type ApiError = ApiSchemas["ApiError"];
export type ApiFieldError = ApiSchemas["ApiFieldError"];

type ClientsListResponse =
  ApiPaths["/clients/"]["get"]["responses"][200]["content"]["application/json"];
export type PaginationMeta = ClientsListResponse["pagination"];
export type PaginatedData<T> = { data: T[]; pagination: PaginationMeta };
