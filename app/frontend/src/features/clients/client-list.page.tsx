import { rqClient } from "@/shared/api/http-client";
import { useHeaderActions } from "@/shared/lib/react/use-header-actions";
import { CONSTANTS } from "@/shared/model/constants";
import { AddButton } from "@/shared/ui/add-button";
import { AsyncWrapper } from "@/shared/ui/async-wrapper";
import { Stack, Title } from "@mantine/core";
import { useState } from "react";
import { ClientTable } from "./ui/client-table";

export function ClientListPage() {
  const [page, setPage] = useState(1);

  useHeaderActions(<AddButton label="New Client" />);

  const query = rqClient.useQuery("get", "/clients/", {
    params: { query: { page, limit: CONSTANTS.TABLE_PAGE_SIZE } },
  });

  return (
    <Stack style={{ flex: 1, minHeight: 0 }}>
      <Title>Clients</Title>
      <AsyncWrapper
        query={query}
        render={({ data: clients, pagination }) => (
          <ClientTable
            clients={clients}
            page={page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        )}
      />
    </Stack>
  );
}
