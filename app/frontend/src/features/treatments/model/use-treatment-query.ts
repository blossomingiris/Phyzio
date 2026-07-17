import { rqClient } from "@/shared/api/http-client";

export function useTreatmentQuery(id: string) {
  return rqClient.useQuery("get", "/treatments/{id}", {
    params: { path: { id: Number(id) } },
  });
}
