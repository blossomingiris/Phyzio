import { rqClient } from "@/shared/api/http-client";

export function useUserQuery(id: string) {
  return rqClient.useQuery("get", "/users/{id}", {
    params: { path: { id: Number(id) }, query: { deleted: true } },
  });
}
