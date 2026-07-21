import { rqClient } from "@/shared/api/http-client";
import {
  TREATMENT_CATEGORY_LABELS,
  type Treatment,
} from "@/shared/domain/treatment";
import { useHeaderActions } from "@/shared/lib/react/use-header-actions";
import { AddButton } from "@/shared/ui/add-button";
import { useServerTable } from "@/shared/ui/data-table/use-server-table";
import { TabCountBadge } from "@/shared/ui/tabs/tab-count-badge";
import { Tabs } from "@/shared/ui/tabs/tabs";
import { Select, Stack, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconListCheck, IconStethoscope, IconX } from "@tabler/icons-react";
import { useState } from "react";
import { TreatmentCreateModal } from "./ui/treatment-create-modal";
import { TreatmentTable } from "./ui/treatment-table";

const CATEGORY_FILTER_OPTIONS = Object.entries(TREATMENT_CATEGORY_LABELS).map(
  ([value, label]) => ({ value, label }),
);

export function TreatmentListPage() {
  const table = useServerTable();
  const [createOpened, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);
  const [category, setCategory] = useState<Treatment["category"] | null>(null);

  useHeaderActions(<AddButton label="New Treatment" onClick={openCreate} />);

  const resetPage = () =>
    table.onPaginationChange((prev) => ({ ...prev, pageIndex: 0 }));

  const handleCategoryChange = (value: string | null) => {
    setCategory(value as Treatment["category"] | null);
    resetPage();
  };

  const activeCount = rqClient.useQuery("get", "/treatments/", {
    params: { query: { limit: 1, isActive: true } },
  });
  const inactiveCount = rqClient.useQuery("get", "/treatments/", {
    params: { query: { limit: 1, isActive: false } },
  });
  const allCount = rqClient.useQuery("get", "/treatments/", {
    params: { query: { limit: 1 } },
  });

  const categorySelect = (
    <Select
      placeholder="All Categories"
      data={CATEGORY_FILTER_OPTIONS}
      value={category}
      onChange={handleCategoryChange}
      clearable
      w={220}
    />
  );

  return (
    <Stack style={{ flex: 1, minHeight: 0 }}>
      <Title>Treatments</Title>
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
            leftSection={<IconStethoscope size={16} />}
            rightSection={
              <TabCountBadge count={activeCount.data?.pagination.total} />
            }
          >
            Active
          </Tabs.Tab>
          <Tabs.Tab
            value="inactive"
            leftSection={<IconX size={16} />}
            rightSection={
              <TabCountBadge count={inactiveCount.data?.pagination.total} />
            }
          >
            Inactive
          </Tabs.Tab>
          <Tabs.Tab
            value="all"
            leftSection={<IconListCheck size={16} />}
            rightSection={
              <TabCountBadge count={allCount.data?.pagination.total} />
            }
          >
            All
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="active" pt="md" style={{ flex: 1, minHeight: 0 }}>
          <TreatmentTable
            table={table}
            status="active"
            category={category ?? undefined}
            toolbarActions={categorySelect}
          />
        </Tabs.Panel>

        <Tabs.Panel value="inactive" pt="md" style={{ flex: 1, minHeight: 0 }}>
          <TreatmentTable
            table={table}
            status="inactive"
            category={category ?? undefined}
            toolbarActions={categorySelect}
          />
        </Tabs.Panel>

        <Tabs.Panel value="all" pt="md" style={{ flex: 1, minHeight: 0 }}>
          <TreatmentTable
            table={table}
            status="all"
            category={category ?? undefined}
            toolbarActions={categorySelect}
          />
        </Tabs.Panel>
      </Tabs>

      <TreatmentCreateModal opened={createOpened} onClose={closeCreate} />
    </Stack>
  );
}
