import { useHeaderActions } from "@/shared/lib/react/use-header-actions";
import { AddButton } from "@/shared/ui/add-button";
import { useServerTable } from "@/shared/ui/data-table/use-server-table";
import { TabCountBadge } from "@/shared/ui/tabs/tab-count-badge";
import { Tabs } from "@/shared/ui/tabs/tabs";
import { Stack, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconUserOff, IconUsers, IconUserX } from "@tabler/icons-react";
import { useClientListStatusCounts } from "./model/use-client-list-status-counts";
import { ClientCreateModal } from "./ui/client-create-modal";
import { ClientTable } from "./ui/client-table";

export function ClientListPage() {
  const table = useServerTable();
  const [createOpened, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);

  useHeaderActions(<AddButton label="New Client" onClick={openCreate} />);

  const resetPage = () =>
    table.onPaginationChange((prev) => ({ ...prev, pageIndex: 0 }));

  const counts = useClientListStatusCounts();

  return (
    <Stack style={{ flex: 1, minHeight: 0 }}>
      <Title>Clients</Title>
      <Tabs
        defaultValue="active"
        onChange={resetPage}
        keepMounted={false}
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Tabs.List>
          <Tabs.Tab
            value="active"
            leftSection={<IconUserX size={16} />}
            rightSection={<TabCountBadge count={counts.active} />}
          >
            Active
          </Tabs.Tab>
          <Tabs.Tab
            value="deleted"
            leftSection={<IconUserOff size={16} />}
            rightSection={<TabCountBadge count={counts.deleted} />}
          >
            Deleted
          </Tabs.Tab>
          <Tabs.Tab
            value="all"
            leftSection={<IconUsers size={16} />}
            rightSection={<TabCountBadge count={counts.all} />}
          >
            All
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="active" pt="md" style={{ flex: 1, minHeight: 0 }}>
          <ClientTable table={table} status="active" />
        </Tabs.Panel>

        <Tabs.Panel value="all" pt="md" style={{ flex: 1, minHeight: 0 }}>
          <ClientTable table={table} status="all" />
        </Tabs.Panel>

        <Tabs.Panel value="deleted" pt="md" style={{ flex: 1, minHeight: 0 }}>
          <ClientTable table={table} status="deleted" />
        </Tabs.Panel>
      </Tabs>

      <ClientCreateModal opened={createOpened} onClose={closeCreate} />
    </Stack>
  );
}
