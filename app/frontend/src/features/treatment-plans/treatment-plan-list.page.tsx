import {
  TREATMENT_PLAN_STATUS_LABELS,
  type TreatmentPlan,
} from "@/shared/domain/treatment-plan";
import { useServerTable } from "@/shared/ui/data-table/use-server-table";
import { Group, Select, Stack, Title } from "@mantine/core";
import { useState } from "react";
import { TreatmentPlanTable } from "./ui/treatment-plan-table";

const STATUS_FILTER_OPTIONS = Object.entries(TREATMENT_PLAN_STATUS_LABELS).map(
  ([value, label]) => ({ value, label }),
);

export function TreatmentPlanListPage() {
  const table = useServerTable();
  const [status, setStatus] = useState<TreatmentPlan["status"] | null>(null);

  const resetPage = () =>
    table.onPaginationChange((prev) => ({ ...prev, pageIndex: 0 }));

  const handleStatusChange = (value: string | null) => {
    setStatus(value as TreatmentPlan["status"] | null);
    resetPage();
  };

  const toolbarActions = (
    <Group gap="sm" wrap="nowrap">
      <Select
        placeholder="All Statuses"
        data={STATUS_FILTER_OPTIONS}
        value={status}
        onChange={handleStatusChange}
        clearable
        w={180}
      />
    </Group>
  );

  return (
    <Stack style={{ flex: 1, minHeight: 0 }}>
      <Title>Treatment Plans</Title>
      <TreatmentPlanTable
        table={table}
        status={status ?? undefined}
        toolbarActions={toolbarActions}
      />
    </Stack>
  );
}
