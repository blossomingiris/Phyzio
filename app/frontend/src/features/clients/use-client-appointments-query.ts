import { rqClient } from "@/shared/api/http-client";
import type { ServerTableState } from "@/shared/ui/data-table/use-server-table";
import { keepPreviousData } from "@tanstack/react-query";

export function useClientAppointmentsQuery(
  clientId: number,
  { pagination, sorting }: ServerTableState,
) {
  const sort = sorting[0];

  return rqClient.useQuery(
    "get",
    "/appointments/",
    {
      params: {
        query: {
          clientId,
          page: pagination.pageIndex + 1,
          limit: pagination.pageSize,
          ...(sort && {
            sortBy: sort.id as "startedAt" | "createdAt",
            sortOrder: sort.desc ? "desc" : "asc",
          }),
        },
      },
    },
    { placeholderData: keepPreviousData },
  );
}
