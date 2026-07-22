import {
  TREATMENT_PLAN_STATUS_COLORS,
  TREATMENT_PLAN_STATUS_LABELS,
  type TreatmentPlan,
} from "@/shared/domain/treatment-plan";
import { formatDate } from "@/shared/lib/date/format-date";
import { ROUTES } from "@/shared/model/routes";
import { DataTable } from "@/shared/ui/data-table/data-table";
import type { ServerTableState } from "@/shared/ui/data-table/use-server-table";
import { TreatmentPlanProgressCell } from "@/shared/ui/treatment-plan-progress-cell";
import { Badge } from "@mantine/core";
import type { MRT_ColumnDef } from "mantine-react-table-open";
import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import { useTreatmentPlansQuery } from "../model/use-treatment-plans-query";

const columns: MRT_ColumnDef<TreatmentPlan>[] = [
  {
    accessorKey: "id",
    header: "ID",
    enableSorting: false,
    Cell: ({ cell }) => `#${cell.getValue<number>()}`,
  },
  {
    id: "client",
    header: "Client",
    enableSorting: false,
    accessorFn: (plan) => `${plan.client.firstName} ${plan.client.lastName}`,
  },
  {
    id: "therapist",
    header: "Therapist",
    enableSorting: false,
    accessorFn: (plan) =>
      `${plan.therapist.firstName} ${plan.therapist.lastName}`,
  },
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: false,
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
    id: "progress",
    header: "Progress",
    enableSorting: false,
    Cell: ({ row }) => <TreatmentPlanProgressCell plan={row.original} />,
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    enableSorting: true,
    Cell: ({ cell }) => formatDate(cell.getValue<string>()),
  },
];

export function TreatmentPlanTable({
  table,
  status,
  toolbarActions,
}: {
  table: ServerTableState;
  status?: TreatmentPlan["status"];
  toolbarActions?: ReactNode;
}) {
  const navigate = useNavigate();
  const query = useTreatmentPlansQuery(table, status);

  return (
    <DataTable
      columns={columns}
      query={query}
      table={table}
      onRowClick={(plan) => navigate(`${ROUTES.TREATMENT_PLANS}/${plan.id}`)}
      renderTopToolbarCustomActions={toolbarActions}
    />
  );
}
