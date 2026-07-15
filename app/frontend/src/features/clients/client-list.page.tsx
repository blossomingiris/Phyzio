import { useHeaderActions } from "@/shared/lib/react/use-header-actions";
import { AddButton } from "@/shared/ui/add-button";
import { useServerTable } from "@/shared/ui/data-table/use-server-table";
import { Tabs } from "@/shared/ui/tabs/tabs";
import { Stack, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconUserCheck, IconUsers } from "@tabler/icons-react";
import { ClientCreateModal } from "./ui/client-create-modal";
import { ClientListTable } from "./ui/client-list-table";

export function ClientListPage() {
  const table = useServerTable();
  const [createOpened, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);

  useHeaderActions(<AddButton label="New Client" onClick={openCreate} />);

  const resetPage = () =>
    table.onPaginationChange((prev) => ({ ...prev, pageIndex: 0 }));

  return (
    <Stack style={{ flex: 1, minHeight: 0 }}>
      <Title>Clients</Title>
      <Tabs
        defaultValue="active"
        onChange={resetPage}
        keepMounted={false}
        style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}
      >
        <Tabs.List>
          <Tabs.Tab value="active" leftSection={<IconUserCheck size={16} />}>
            Active
          </Tabs.Tab>
          <Tabs.Tab value="all" leftSection={<IconUsers size={16} />}>
            All
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="active" pt="md" style={{ flex: 1, minHeight: 0 }}>
          <ClientListTable table={table} deleted={false} />
        </Tabs.Panel>

        <Tabs.Panel value="all" pt="md" style={{ flex: 1, minHeight: 0 }}>
          <ClientListTable table={table} deleted />
        </Tabs.Panel>
      </Tabs>

      <ClientCreateModal opened={createOpened} onClose={closeCreate} />
    </Stack>
  );
}
