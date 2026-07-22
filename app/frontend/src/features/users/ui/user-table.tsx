import { USER_ROLE_LABELS, type AdminUser } from "@/shared/domain/user";
import { formatDate } from "@/shared/lib/date/format-date";
import { ROUTES } from "@/shared/model/routes";
import { DataTable } from "@/shared/ui/data-table/data-table";
import type { ServerTableState } from "@/shared/ui/data-table/use-server-table";
import { Badge } from "@mantine/core";
import type { MRT_ColumnDef } from "mantine-react-table-open";
import { useMemo, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { useUsersQuery } from "../model/use-users-query";

const baseColumns: MRT_ColumnDef<AdminUser>[] = [
  {
    accessorKey: "firstName",
    header: "First Name",
    enableSorting: false,
  },
  {
    accessorKey: "lastName",
    header: "Last Name",
  },
  {
    accessorKey: "email",
    header: "Email",
    Cell: ({ cell, row }) =>
      row.original.deletedAt ? "—" : cell.getValue<string>(),
  },
  {
    accessorKey: "role",
    header: "Role",
    enableSorting: false,
    Cell: ({ cell }) => {
      const role = cell.getValue<AdminUser["role"]>();
      return (
        <Badge
          color={role === "admin" ? "primary" : "accent"}
          variant="light"
        >
          {USER_ROLE_LABELS[role]}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    Cell: ({ cell }) => formatDate(cell.getValue<string>()),
  },
];

const deletedAtColumn: MRT_ColumnDef<AdminUser> = {
  accessorKey: "deletedAt",
  header: "Deleted",
  enableSorting: false,
  Cell: ({ cell }) => formatDate(cell.getValue<string | null>()),
};

const statusColumn: MRT_ColumnDef<AdminUser> = {
  id: "status",
  header: "Status",
  enableSorting: false,
  Cell: ({ row }) => {
    const isDeleted = !!row.original.deletedAt;
    return (
      <Badge color={isDeleted ? "error" : "success"} variant="light">
        {isDeleted ? "Deleted" : "Active"}
      </Badge>
    );
  },
};

export function UserTable({
  table,
  status,
  role,
  toolbarActions,
}: {
  table: ServerTableState;
  status: "active" | "all" | "deleted";
  role?: AdminUser["role"];
  toolbarActions?: ReactNode;
}) {
  const navigate = useNavigate();
  const query = useUsersQuery(table, status, role);
  const columns = useMemo(() => {
    if (status === "deleted") return [...baseColumns, deletedAtColumn];
    if (status === "all") return [...baseColumns, statusColumn];
    return baseColumns;
  }, [status]);

  return (
    <DataTable
      columns={columns}
      query={query}
      table={table}
      onRowClick={(user) => navigate(`${ROUTES.USERS}/${user.id}`)}
      renderTopToolbarCustomActions={toolbarActions}
    />
  );
}
