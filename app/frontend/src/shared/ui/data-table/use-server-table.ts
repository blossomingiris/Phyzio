import { CONSTANTS } from "@/shared/model/constants";
import { useState } from "react";
import type {
  MRT_PaginationState,
  MRT_SortingState,
  MRT_Updater,
} from "mantine-react-table-open";

export type ServerTableState = {
  pagination: MRT_PaginationState;
  onPaginationChange: (updater: MRT_Updater<MRT_PaginationState>) => void;
  sorting: MRT_SortingState;
  onSortingChange: (updater: MRT_Updater<MRT_SortingState>) => void;
  globalFilter: string;
  onGlobalFilterChange: (updater: MRT_Updater<string>) => void;
};

function resolveUpdater<T>(updater: MRT_Updater<T>, prev: T): T {
  return typeof updater === "function"
    ? (updater as (prev: T) => T)(prev)
    : updater;
}

export function useServerTable(
  pageSize = CONSTANTS.TABLE_PAGE_SIZE,
): ServerTableState {
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize,
  });
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const onGlobalFilterChange: ServerTableState["onGlobalFilterChange"] = (
    updater,
  ) => {
    setGlobalFilter((prev) => resolveUpdater(updater, prev));
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  return {
    pagination,
    onPaginationChange: setPagination,
    sorting,
    onSortingChange: setSorting,
    globalFilter,
    onGlobalFilterChange,
  };
}
