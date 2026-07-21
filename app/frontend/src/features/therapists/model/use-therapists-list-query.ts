import type { Therapist } from "@/shared/domain/therapist";
import { rqClient } from "@/shared/api/http-client";
import type { ServerTableState } from "@/shared/ui/data-table/use-server-table";
import { keepPreviousData } from "@tanstack/react-query";

export function useTherapistsListQuery(
  { pagination, sorting, globalFilter }: ServerTableState,
  status: "active" | "all" | "deleted",
  speciality?: Therapist["speciality"],
  isActive?: boolean,
) {
  const sort = sorting[0];

  return rqClient.useQuery(
    "get",
    "/therapists/",
    {
      params: {
        query: {
          page: pagination.pageIndex + 1,
          limit: pagination.pageSize,
          search: globalFilter || undefined,
          deleted: status,
          speciality,
          isActive,
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
