import { rqClient } from "@/shared/api/http-client";

export function useClientItemCounts(clientId: number) {
  const appointmentsCount = rqClient.useQuery("get", "/appointments/", {
    params: { query: { limit: 1, clientId } },
  });
  const treatmentPlansCount = rqClient.useQuery("get", "/treatment-plans/", {
    params: { query: { limit: 1, clientId } },
  });

  return {
    appointments: appointmentsCount.data?.pagination.total,
    treatmentPlans: treatmentPlansCount.data?.pagination.total,
  };
}
