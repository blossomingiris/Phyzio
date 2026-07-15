import type { PaginatedData } from "@/shared/api/types";
import type { Client } from "@/shared/domain/client";
import { SPECIALITY_LABELS } from "@/shared/domain/therapist";
import { formatDate } from "@/shared/lib/date/format-date";
import { ROUTES } from "@/shared/model/routes";
import { DataTable } from "@/shared/ui/data-table/data-table";
import type { ServerTableState } from "@/shared/ui/data-table/use-server-table";
import { Badge, Group, Stack, Text } from "@mantine/core";
import type { UseQueryResult } from "@tanstack/react-query";
import type { MRT_ColumnDef } from "mantine-react-table-open";
import { useNavigate } from "react-router";

const columns: MRT_ColumnDef<Client>[] = [
  {
    accessorKey: "firstName",
    header: "First Name",
    enableSorting: false,
  },
  {
    accessorKey: "lastName",
    header: "Last Name",
    Cell: ({ row }) => {
      const client = row.original;
      return (
        <Group gap={6}>
          <Text size="sm">{client.lastName}</Text>
          {client.deletedAt && (
            <Badge color="error" variant="light" size="xs">
              Deleted
            </Badge>
          )}
        </Group>
      );
    },
  },
  {
    accessorKey: "phone",
    header: "Phone",
    enableSorting: false,
    Cell: ({ cell }) => cell.getValue<string | null>() ?? "—",
  },
  {
    accessorKey: "email",
    header: "Email",
    enableSorting: false,
    Cell: ({ cell }) => cell.getValue<string | null>() ?? "—",
  },
  {
    accessorKey: "birthDate",
    header: "Birth Date",
    enableSorting: false,
    Cell: ({ cell }) => formatDate(cell.getValue<string | null>()),
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
              <Badge color="accent" size="xs">
                Inactive
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

export function ClientTable({
  query,
  table,
}: {
  query: UseQueryResult<PaginatedData<Client>, unknown>;
  table: ServerTableState;
}) {
  const navigate = useNavigate();

  return (
    <DataTable
      columns={columns}
      query={query}
      table={table}
      onRowClick={(client) => navigate(`${ROUTES.CLIENTS}/${client.id}`)}
    />
  );
}
