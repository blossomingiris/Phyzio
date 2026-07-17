import {
  TREATMENT_CATEGORY_ICONS,
  TREATMENT_CATEGORY_LABELS,
  type Treatment,
} from "@/shared/domain/treatment";
import { formatDate } from "@/shared/lib/date/format-date";
import { ROUTES } from "@/shared/model/routes";
import { DataTable } from "@/shared/ui/data-table/data-table";
import type { ServerTableState } from "@/shared/ui/data-table/use-server-table";
import { Badge, Group, Stack, Text } from "@mantine/core";
import type { MRT_ColumnDef } from "mantine-react-table-open";
import { useMemo, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { useTreatmentsQuery } from "../model/use-treatments-query";

const baseColumns: MRT_ColumnDef<Treatment>[] = [
  {
    accessorKey: "name",
    header: "Name",
    enableSorting: false,
  },
  {
    accessorKey: "category",
    header: "Category",
    Cell: ({ cell }) => {
      const category = cell.getValue<Treatment["category"]>();
      const CategoryIcon = TREATMENT_CATEGORY_ICONS[category];
      return (
        <Group gap={6} wrap="nowrap">
          <CategoryIcon
            size={16}
            stroke={1.5}
            color="var(--mantine-color-dimmed)"
          />
          {TREATMENT_CATEGORY_LABELS[category]}
        </Group>
      );
    },
  },
  {
    accessorKey: "pricePerUnit",
    header: "Price per Unit",
    Cell: ({ row }) => (
      <Stack gap={0}>
        <Text size="sm">{row.original.pricePerUnit}</Text>
        <Text size="xs" c="dimmed">
          {row.original.totalWithVat ?? "—"} w/ VAT
        </Text>
      </Stack>
    ),
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
  },
  {
    accessorKey: "durationMinutes",
    header: "Duration",
    Cell: ({ cell }) => `${cell.getValue<number>()} min`,
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    Cell: ({ cell }) => formatDate(cell.getValue<string>()),
  },
];

const statusColumn: MRT_ColumnDef<Treatment> = {
  accessorKey: "isActive",
  header: "Status",
  enableSorting: false,
  Cell: ({ cell }) =>
    cell.getValue<boolean>() ? (
      <Badge color="success" variant="light" size="sm">
        Active
      </Badge>
    ) : (
      <Badge color="error" variant="light" size="sm">
        Inactive
      </Badge>
    ),
};

export function TreatmentTable({
  table,
  status,
  category,
  toolbarActions,
}: {
  table: ServerTableState;
  status: "active" | "all" | "inactive";
  category?: Treatment["category"];
  toolbarActions?: ReactNode;
}) {
  const navigate = useNavigate();
  const query = useTreatmentsQuery(table, status, category);
  const columns = useMemo(
    () => (status === "all" ? [...baseColumns, statusColumn] : baseColumns),
    [status],
  );

  return (
    <DataTable
      columns={columns}
      query={query}
      table={table}
      onRowClick={(treatment) =>
        navigate(`${ROUTES.TREATMENTS}/${treatment.id}`)
      }
      renderTopToolbarCustomActions={toolbarActions}
    />
  );
}
