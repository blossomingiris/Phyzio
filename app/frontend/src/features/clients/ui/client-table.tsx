import type { Client } from "@/shared/domain/client";
import { SPECIALITY_LABELS } from "@/shared/domain/therapist";
import { formatDate } from "@/shared/lib/date/format-date";
import { ROUTES } from "@/shared/model/routes";
import { DataTable } from "@/shared/ui/data-table/data-table";
import type { ServerTableState } from "@/shared/ui/data-table/use-server-table";
import { Badge, Group, Stack, Text } from "@mantine/core";
import type { MRT_ColumnDef } from "mantine-react-table-open";
import { useMemo } from "react";
import { useNavigate } from "react-router";
import { useClientsQuery } from "../model/use-clients-query";

const baseColumns: MRT_ColumnDef<Client>[] = [
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
    accessorKey: "phone",
    header: "Phone",
    enableSorting: false,
    Cell: ({ cell, row }) =>
      row.original.deletedAt ? "—" : (cell.getValue<string | null>() ?? "—"),
  },
  {
    accessorKey: "email",
    header: "Email",
    enableSorting: false,
    Cell: ({ cell, row }) =>
      row.original.deletedAt ? "—" : (cell.getValue<string | null>() ?? "—"),
  },
  {
    accessorKey: "birthDate",
    header: "Birth Date",
    enableSorting: false,
    Cell: ({ cell, row }) =>
      row.original.deletedAt ? "—" : formatDate(cell.getValue<string | null>()),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    Cell: ({ cell }) => formatDate(cell.getValue<string>()),
  },
  {
    id: "therapist",
    header: "Therapist",
    enableSorting: false,
    accessorFn: (client) =>
      client.therapist
        ? `${client.therapist.firstName} ${client.therapist.lastName}`
        : "—",
    Cell: ({ row }) => {
      const therapist = row.original.therapist;
      if (!therapist) return "—";
      return (
        <Stack gap={2}>
          <Group gap={6}>
            <Text size="sm">
              {therapist.firstName} {therapist.lastName}
            </Text>
            {!therapist.isActive && (
              <Badge color="accent" variant="light" size="xs">
                Unavailable
              </Badge>
            )}
          </Group>
          <Text size="xs" c="dimmed">
            {SPECIALITY_LABELS[therapist.speciality]}
          </Text>
        </Stack>
      );
    },
  },
];

const deletedAtColumn: MRT_ColumnDef<Client> = {
  accessorKey: "deletedAt",
  header: "Deleted",
  enableSorting: false,
  Cell: ({ cell }) => formatDate(cell.getValue<string | null>()),
};

const statusColumn: MRT_ColumnDef<Client> = {
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

export function ClientTable({
  table,
  status,
}: {
  table: ServerTableState;
  status: "active" | "all" | "deleted";
}) {
  const navigate = useNavigate();
  const query = useClientsQuery(table, status);
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
      onRowClick={(client) => navigate(`${ROUTES.CLIENTS}/${client.id}`)}
    />
  );
}
