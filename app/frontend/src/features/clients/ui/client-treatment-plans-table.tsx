import { TREATMENT_CATEGORY_LABELS } from "@/shared/domain/treatment";
import {
  TREATMENT_PLAN_STATUS_COLORS,
  TREATMENT_PLAN_STATUS_LABELS,
  getTreatmentPlanProgress,
  type TreatmentPlan,
} from "@/shared/domain/treatment-plan";
import { formatDate } from "@/shared/lib/date/format-date";
import { ROUTES } from "@/shared/model/routes";
import { DataTable } from "@/shared/ui/data-table/data-table";
import { useServerTable } from "@/shared/ui/data-table/use-server-table";
import { Anchor, Badge, Group, Progress, Stack, Text } from "@mantine/core";
import type { MRT_ColumnDef } from "mantine-react-table-open";
import { Link } from "react-router";
import { useClientTreatmentPlansQuery } from "../model/use-client-treatment-plans-query";

function getTreatmentPlanProgressColor(percent: number): string {
  if (percent <= 0) return "gray";
  if (percent >= 100) return "success";
  if (percent >= 66) return "blue";
  if (percent >= 33) return "yellow";
  return "accent";
}

const columns: MRT_ColumnDef<TreatmentPlan>[] = [
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: true,
    Cell: ({ cell }) => {
      const status = cell.getValue<TreatmentPlan["status"]>();
      return (
        <Badge color={TREATMENT_PLAN_STATUS_COLORS[status]} variant="light">
          {TREATMENT_PLAN_STATUS_LABELS[status]}
        </Badge>
      );
    },
  },
  {
    accessorKey: "primaryDiagnostic",
    header: "Primary Diagnostic",
    enableSorting: false,
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    enableSorting: true,
    Cell: ({ cell }) => formatDate(cell.getValue<string>()),
  },
  {
    accessorKey: "endDate",
    header: "End Date",
    enableSorting: false,
    Cell: ({ cell }) => formatDate(cell.getValue<string | null>()),
  },
  {
    id: "therapist",
    header: "Therapist",
    enableSorting: false,
    accessorFn: (plan) =>
      `${plan.therapist.firstName} ${plan.therapist.lastName}`,
  },
  {
    id: "progress",
    header: "Progress",
    enableSorting: false,
    Cell: ({ row }) => {
      const { total, completed, left } = getTreatmentPlanProgress(row.original);
      if (total === 0) {
        return (
          <Text size="xs" c="dimmed">
            No items
          </Text>
        );
      }
      const percent = (completed / total) * 100;
      return (
        <Stack gap={4} miw={140}>
          <Progress
            value={percent}
            color={getTreatmentPlanProgressColor(percent)}
            size="sm"
          />
          <Text size="xs" c="dimmed">
            {completed}/{total} sessions · {left} left
          </Text>
        </Stack>
      );
    },
  },
  {
    id: "treatments",
    header: "Treatments",
    enableSorting: false,
    Cell: ({ row }) => (
      <Group gap="xs">
        {row.original.items.map((item) => (
          <Anchor
            key={item.id}
            component={Link}
            to={`${ROUTES.TREATMENTS}/${item.treatment.id}`}
            size="sm"
            underline="always"
          >
            {TREATMENT_CATEGORY_LABELS[item.treatment.category]} ·{" "}
            {item.treatment.durationMinutes} min
          </Anchor>
        ))}
      </Group>
    ),
  },
];

export function ClientTreatmentPlansTable({ clientId }: { clientId: number }) {
  const table = useServerTable();
  const query = useClientTreatmentPlansQuery(clientId, table);

  return (
    <DataTable
      columns={columns}
      query={query}
      table={table}
      enableGlobalFilter={false}
    />
  );
}
