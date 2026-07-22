import { rqClient } from "@/shared/api/http-client";

export function useTherapistItemCounts(therapistId: number) {
  const clientsCount = rqClient.useQuery("get", "/clients/", {
    params: { query: { limit: 1, therapistId } },
  });
  const appointmentsCount = rqClient.useQuery("get", "/appointments/", {
    params: { query: { limit: 1, therapistId } },
  });
  const treatmentPlansCount = rqClient.useQuery("get", "/treatment-plans/", {
    params: { query: { limit: 1, therapistId } },
  });

  return {
    clients: clientsCount.data?.pagination.total,
    appointments: appointmentsCount.data?.pagination.total,
    treatmentPlans: treatmentPlansCount.data?.pagination.total,
  };
}
