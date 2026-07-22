import {
  TREATMENT_PLAN_STATUS_COLORS,
  TREATMENT_PLAN_STATUS_LABELS,
  type TreatmentPlan,
} from "@/shared/domain/treatment-plan";
import { formatDate } from "@/shared/lib/date/format-date";
import { ROUTES } from "@/shared/model/routes";
import { DataTable } from "@/shared/ui/data-table/data-table";
import { useServerTable } from "@/shared/ui/data-table/use-server-table";
import { TreatmentPlanProgressCell } from "@/shared/ui/treatment-plan-progress-cell";
import { Anchor, Badge, Group, Select } from "@mantine/core";
import type { MRT_ColumnDef } from "mantine-react-table-open";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useTherapistTreatmentPlansQuery } from "../model/use-therapist-treatment-plans-query";

const STATUS_FILTER_OPTIONS = Object.entries(TREATMENT_PLAN_STATUS_LABELS).map(
  ([value, label]) => ({ value, label }),
);

const columns: MRT_ColumnDef<TreatmentPlan>[] = [
  {
    accessorKey: "id",
    header: "ID",
    enableSorting: false,
    Cell: ({ cell }) => `#${cell.getValue<number>()}`,
  },
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
    id: "client",
    header: "Client",
    enableSorting: false,
    accessorFn: (plan) => `${plan.client.firstName} ${plan.client.lastName}`,
  },
  {
    id: "progress",
    header: "Progress",
    enableSorting: false,
    Cell: ({ row }) => <TreatmentPlanProgressCell plan={row.original} />,
  },
  {
    id: "treatments",
    header: "Treatments",
    enableSorting: false,
    Cell: ({ row }) => (
      <Group gap="xs" onClick={(e) => e.stopPropagation()}>
        {row.original.items.map((item) => (
          <Anchor
            key={item.id}
            component={Link}
            to={`${ROUTES.TREATMENTS}/${item.treatment.id}`}
            size="sm"
            underline="always"
          >
            {item.treatment.name}
          </Anchor>
        ))}
      </Group>
    ),
  },
];

export function TherapistTreatmentPlansTable({
  therapistId,
}: {
  therapistId: number;
}) {
  const navigate = useNavigate();
  const table = useServerTable();
  const [status, setStatus] = useState<TreatmentPlan["status"] | null>(null);

  const query = useTherapistTreatmentPlansQuery(
    therapistId,
    table,
    status ?? undefined,
  );

  const handleStatusChange = (value: string | null) => {
    setStatus(value as TreatmentPlan["status"] | null);
    table.onPaginationChange((prev) => ({ ...prev, pageIndex: 0 }));
  };

  return (
    <DataTable
      columns={columns}
      query={query}
      table={table}
      onRowClick={(plan) => navigate(`${ROUTES.TREATMENT_PLANS}/${plan.id}`)}
      renderTopToolbarCustomActions={
        <Select
          placeholder="All Statuses"
          data={STATUS_FILTER_OPTIONS}
          value={status}
          onChange={handleStatusChange}
          clearable
          w={180}
        />
      }
    />
  );
}
