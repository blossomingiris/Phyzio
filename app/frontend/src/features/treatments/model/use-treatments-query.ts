import type { Treatment } from "@/shared/domain/treatment";
import { rqClient } from "@/shared/api/http-client";
import type { ServerTableState } from "@/shared/ui/data-table/use-server-table";
import { keepPreviousData } from "@tanstack/react-query";

export function useTreatmentsQuery(
  { pagination, sorting, globalFilter }: ServerTableState,
  status: "active" | "all" | "inactive",
  category?: Treatment["category"],
) {
  const sort = sorting[0];

  return rqClient.useQuery(
    "get",
    "/treatments/",
    {
      params: {
        query: {
          page: pagination.pageIndex + 1,
          limit: pagination.pageSize,
          search: globalFilter || undefined,
          category,
          isActive:
            status === "active" ? true : status === "inactive" ? false : undefined,
          ...(sort && {
            sortBy: sort.id as
              | "createdAt"
              | "category"
              | "pricePerUnit"
              | "durationMinutes"
              | "quantity",
            sortOrder: sort.desc ? "desc" : "asc",
          }),
        },
      },
    },
    { placeholderData: keepPreviousData },
  );
}
