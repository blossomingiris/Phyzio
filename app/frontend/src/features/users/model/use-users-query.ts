import type { UserRole } from "@/shared/domain/user";
import { rqClient } from "@/shared/api/http-client";
import type { ServerTableState } from "@/shared/ui/data-table/use-server-table";
import { keepPreviousData } from "@tanstack/react-query";

export function useUsersQuery(
  { pagination, sorting, globalFilter }: ServerTableState,
  status: "active" | "all" | "deleted",
  role?: UserRole,
) {
  const sort = sorting[0];

  return rqClient.useQuery(
    "get",
    "/users/",
    {
      params: {
        query: {
          page: pagination.pageIndex + 1,
          limit: pagination.pageSize,
          search: globalFilter || undefined,
          deleted: status,
          role,
          ...(sort && {
            sortBy: sort.id as "createdAt" | "lastName" | "email",
            sortOrder: sort.desc ? "desc" : "asc",
          }),
        },
      },
    },
    { placeholderData: keepPreviousData },
  );
}
