import { rqClient } from "@/shared/api/http-client";

export function useActiveTherapistsQuery({
  isActive,
}: { isActive?: boolean } = {}) {
  return rqClient.useQuery("get", "/therapists/", {
    params: {
      query: {
        limit: 100,
        sortBy: "lastName",
        sortOrder: "asc",
        isActive,
      },
    },
  });
}
