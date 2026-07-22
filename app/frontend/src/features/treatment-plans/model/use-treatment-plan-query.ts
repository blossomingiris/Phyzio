import { rqClient } from "@/shared/api/http-client";

export function useTreatmentPlanQuery(id: string) {
  return rqClient.useQuery("get", "/treatment-plans/{id}", {
    params: { path: { id: Number(id) } },
  });
}
