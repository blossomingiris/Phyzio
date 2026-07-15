import { rqClient } from "@/shared/api/http-client";

export function useClientQuery(id: string) {
  return rqClient.useQuery("get", "/clients/{id}", {
    params: { path: { id: Number(id) }, query: { deleted: true } },
  });
}
