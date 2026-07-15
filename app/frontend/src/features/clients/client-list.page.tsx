import { useHeaderActions } from "@/shared/lib/react/use-header-actions";
import { AddButton } from "@/shared/ui/add-button";
import { useServerTable } from "@/shared/ui/data-table/use-server-table";
import { Stack, Title } from "@mantine/core";
import { ClientTable } from "./ui/client-table";
import { useClientsQuery } from "./use-clients-query";

export function ClientListPage() {
  const table = useServerTable();

  useHeaderActions(<AddButton label="New Client" />);

  const query = useClientsQuery(table);

  return (
    <Stack style={{ flex: 1, minHeight: 0 }}>
      <Title>Clients</Title>
      <ClientTable query={query} table={table} />
    </Stack>
  );
}
