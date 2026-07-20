import { rqClient } from "@/shared/api/http-client";

export function useTherapistQuery(id: string) {
  return rqClient.useQuery("get", "/therapists/{id}", {
    params: { path: { id: Number(id) }, query: { deleted: true } },
  });
}
