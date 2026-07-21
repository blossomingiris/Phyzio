import { rqClient } from "@/shared/api/http-client";

export function useClientListStatusCounts() {
  const activeCount = rqClient.useQuery("get", "/clients/", {
    params: { query: { limit: 1, deleted: "active" } },
  });
  const deletedCount = rqClient.useQuery("get", "/clients/", {
    params: { query: { limit: 1, deleted: "deleted" } },
  });
  const allCount = rqClient.useQuery("get", "/clients/", {
    params: { query: { limit: 1, deleted: "all" } },
  });

  return {
    active: activeCount.data?.pagination.total,
    deleted: deletedCount.data?.pagination.total,
    all: allCount.data?.pagination.total,
  };
}
