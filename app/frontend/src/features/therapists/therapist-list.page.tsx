import { useHeaderActions } from "@/shared/lib/react/use-header-actions";
import { AddButton } from "@/shared/ui/add-button";
import { useServerTable } from "@/shared/ui/data-table/use-server-table";
import { Tabs } from "@/shared/ui/tabs/tabs";
import { Stack, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconUserOff, IconUsers, IconUserX } from "@tabler/icons-react";
import { TherapistCreateModal } from "./ui/therapist-create-modal";
import { TherapistTable } from "./ui/therapist-table";

export function TherapistListPage() {
  const table = useServerTable();
  const [createOpened, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);

  useHeaderActions(<AddButton label="New Therapist" onClick={openCreate} />);

  const resetPage = () =>
    table.onPaginationChange((prev) => ({ ...prev, pageIndex: 0 }));

  return (
    <Stack style={{ flex: 1, minHeight: 0 }}>
      <Title>Therapists</Title>
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
          <Tabs.Tab value="active" leftSection={<IconUserX size={16} />}>
            Active
          </Tabs.Tab>
          <Tabs.Tab value="deleted" leftSection={<IconUserOff size={16} />}>
            Deleted
          </Tabs.Tab>
          <Tabs.Tab value="all" leftSection={<IconUsers size={16} />}>
            All
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="active" pt="md" style={{ flex: 1, minHeight: 0 }}>
          <TherapistTable table={table} status="active" />
        </Tabs.Panel>

        <Tabs.Panel value="all" pt="md" style={{ flex: 1, minHeight: 0 }}>
          <TherapistTable table={table} status="all" />
        </Tabs.Panel>

        <Tabs.Panel value="deleted" pt="md" style={{ flex: 1, minHeight: 0 }}>
          <TherapistTable table={table} status="deleted" />
        </Tabs.Panel>
      </Tabs>

      <TherapistCreateModal opened={createOpened} onClose={closeCreate} />
    </Stack>
  );
}
