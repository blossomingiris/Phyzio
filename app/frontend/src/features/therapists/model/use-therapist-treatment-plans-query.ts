import type { TreatmentPlan } from "@/shared/domain/treatment-plan";
import { rqClient } from "@/shared/api/http-client";
import type { ServerTableState } from "@/shared/ui/data-table/use-server-table";
import { keepPreviousData } from "@tanstack/react-query";

export function useTherapistTreatmentPlansQuery(
  therapistId: number,
  { pagination, sorting, globalFilter }: ServerTableState,
  status?: TreatmentPlan["status"],
) {
  const sort = sorting[0];

  return rqClient.useQuery(
    "get",
    "/treatment-plans/",
    {
      params: {
        query: {
          therapistId,
          page: pagination.pageIndex + 1,
          limit: pagination.pageSize,
          search: globalFilter || undefined,
          status,
          ...(sort && {
            sortBy: sort.id as "createdAt" | "startDate" | "status",
            sortOrder: sort.desc ? "desc" : "asc",
          }),
        },
      },
    },
    { placeholderData: keepPreviousData },
  );
}
