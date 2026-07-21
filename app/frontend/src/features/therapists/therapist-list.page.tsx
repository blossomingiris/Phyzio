import { rqClient } from "@/shared/api/http-client";
import { SPECIALITY_LABELS, type Therapist } from "@/shared/domain/therapist";
import { useHeaderActions } from "@/shared/lib/react/use-header-actions";
import { AddButton } from "@/shared/ui/add-button";
import { useServerTable } from "@/shared/ui/data-table/use-server-table";
import { TabCountBadge } from "@/shared/ui/tabs/tab-count-badge";
import { Tabs } from "@/shared/ui/tabs/tabs";
import { Group, Select, Stack, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconUserOff, IconUsers, IconUserX } from "@tabler/icons-react";
import { useState } from "react";
import { TherapistCreateModal } from "./ui/therapist-create-modal";
import { TherapistTable } from "./ui/therapist-table";

const SPECIALITY_FILTER_OPTIONS = Object.entries(SPECIALITY_LABELS).map(
  ([value, label]) => ({ value, label }),
);

const AVAILABILITY_FILTER_OPTIONS = [
  { value: "true", label: "Available" },
  { value: "false", label: "Unavailable" },
];

export function TherapistListPage() {
  const table = useServerTable();
  const [createOpened, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);
  const [speciality, setSpeciality] = useState<Therapist["speciality"] | null>(
    null,
  );
  const [isActive, setIsActive] = useState<string | null>(null);

  useHeaderActions(<AddButton label="New Therapist" onClick={openCreate} />);

  const resetPage = () =>
    table.onPaginationChange((prev) => ({ ...prev, pageIndex: 0 }));

  const handleSpecialityChange = (value: string | null) => {
    setSpeciality(value as Therapist["speciality"] | null);
    resetPage();
  };

  const handleIsActiveChange = (value: string | null) => {
    setIsActive(value);
    resetPage();
  };

  const isActiveFilter = isActive === null ? undefined : isActive === "true";

  const activeCount = rqClient.useQuery("get", "/therapists/", {
    params: { query: { limit: 1, deleted: "active" } },
  });
  const deletedCount = rqClient.useQuery("get", "/therapists/", {
    params: { query: { limit: 1, deleted: "deleted" } },
  });
  const allCount = rqClient.useQuery("get", "/therapists/", {
    params: { query: { limit: 1, deleted: "all" } },
  });

  const toolbarActions = (
    <Group gap="sm" wrap="nowrap">
      <Select
        placeholder="All Specialities"
        data={SPECIALITY_FILTER_OPTIONS}
        value={speciality}
        onChange={handleSpecialityChange}
        clearable
        w={200}
      />
      <Select
        placeholder="All Availability"
        data={AVAILABILITY_FILTER_OPTIONS}
        value={isActive}
        onChange={handleIsActiveChange}
        clearable
        w={180}
      />
    </Group>
  );

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
          <Tabs.Tab
            value="active"
            leftSection={<IconUserX size={16} />}
            rightSection={
              <TabCountBadge count={activeCount.data?.pagination.total} />
            }
          >
            Active
          </Tabs.Tab>
          <Tabs.Tab
            value="deleted"
            leftSection={<IconUserOff size={16} />}
            rightSection={
              <TabCountBadge count={deletedCount.data?.pagination.total} />
            }
          >
            Deleted
          </Tabs.Tab>
          <Tabs.Tab
            value="all"
            leftSection={<IconUsers size={16} />}
            rightSection={
              <TabCountBadge count={allCount.data?.pagination.total} />
            }
          >
            All
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="active" pt="md" style={{ flex: 1, minHeight: 0 }}>
          <TherapistTable
            table={table}
            status="active"
            speciality={speciality ?? undefined}
            isActive={isActiveFilter}
            toolbarActions={toolbarActions}
          />
        </Tabs.Panel>

        <Tabs.Panel value="all" pt="md" style={{ flex: 1, minHeight: 0 }}>
          <TherapistTable
            table={table}
            status="all"
            speciality={speciality ?? undefined}
            isActive={isActiveFilter}
            toolbarActions={toolbarActions}
          />
        </Tabs.Panel>

        <Tabs.Panel value="deleted" pt="md" style={{ flex: 1, minHeight: 0 }}>
          <TherapistTable
            table={table}
            status="deleted"
            speciality={speciality ?? undefined}
            isActive={isActiveFilter}
            toolbarActions={toolbarActions}
          />
        </Tabs.Panel>
      </Tabs>

      <TherapistCreateModal opened={createOpened} onClose={closeCreate} />
    </Stack>
  );
}
