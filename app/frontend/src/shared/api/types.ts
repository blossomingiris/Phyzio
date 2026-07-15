import type { ApiSchemas } from "./generated";

export type ApiError = ApiSchemas["ApiError"];
export type ApiFieldError = ApiSchemas["ApiFieldError"];

export type PaginationMeta = ApiSchemas["PaginationMeta"];
export type PaginatedData<T> = { data: T[]; pagination: PaginationMeta };
