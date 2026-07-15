import { getApiErrorMessage } from "@/shared/api/errors";
import type { PaginatedData } from "@/shared/api/types";
import type { UseQueryResult } from "@tanstack/react-query";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
} from "mantine-react-table-open";
import { useMemo, type CSSProperties } from "react";
import type { ServerTableState } from "./use-server-table";

const EMPTY_DATA: never[] = [];

export type DataTableProps<
  TData extends Record<string, unknown>,
  TError = unknown,
> = {
  columns: MRT_ColumnDef<TData>[];
  query: UseQueryResult<PaginatedData<TData>, TError>;
  table: ServerTableState;
  onRowClick?: (row: TData) => void;
  enableGlobalFilter?: boolean;
};

export function DataTable<
  TData extends Record<string, unknown>,
  TError = unknown,
>({
  columns,
  query,
  table,
  onRowClick,
  enableGlobalFilter = true,
}: DataTableProps<TData, TError>) {
  "use no memo";

  const { data, isPending, isError, error } = query;
  const rows = useMemo(() => data?.data ?? EMPTY_DATA, [data]);

  const {
    pagination,
    onPaginationChange,
    sorting,
    onSortingChange,
    globalFilter,
    onGlobalFilterChange,
  } = table;

  const mrtTable = useMantineReactTable({
    columns,
    data: rows,
    rowCount: data?.pagination.total ?? 0,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    enableGlobalFilter,
    enableColumnActions: false,
    enableColumnFilters: false,
    enableHiding: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    onPaginationChange,
    onSortingChange,
    onGlobalFilterChange,
    state: {
      pagination,
      sorting,
      globalFilter,
      showSkeletons: isPending,
      showAlertBanner: isError,
    },
    mantineBottomToolbarProps: {
      style: {
        "--text-fz": "var(--mantine-font-size-sm)",
      } as CSSProperties,
    },
    mantineHighlightProps: { color: "accent.1" },
    mantineTableBodyRowProps: onRowClick
      ? ({ row }) => ({
          onClick: () => onRowClick(row.original),
          style: { cursor: "pointer" },
        })
      : undefined,
    mantineToolbarAlertBannerProps: isError
      ? { color: "error", children: getApiErrorMessage(error) }
      : undefined,
  });

  return <MantineReactTable table={mrtTable} />;
}
