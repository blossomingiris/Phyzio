import { rqClient } from "@/shared/api/http-client";

export function useTreatmentListStatusCounts() {
  const activeCount = rqClient.useQuery("get", "/treatments/", {
    params: { query: { limit: 1, isActive: true } },
  });
  const inactiveCount = rqClient.useQuery("get", "/treatments/", {
    params: { query: { limit: 1, isActive: false } },
  });
  const allCount = rqClient.useQuery("get", "/treatments/", {
    params: { query: { limit: 1 } },
  });

  return {
    active: activeCount.data?.pagination.total,
    inactive: inactiveCount.data?.pagination.total,
    all: allCount.data?.pagination.total,
  };
}
