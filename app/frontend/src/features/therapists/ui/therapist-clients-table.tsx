import type { Client } from "@/shared/domain/client";
import { formatDate } from "@/shared/lib/date/format-date";
import { ROUTES } from "@/shared/model/routes";
import { DataTable } from "@/shared/ui/data-table/data-table";
import { useServerTable } from "@/shared/ui/data-table/use-server-table";
import type { MRT_ColumnDef } from "mantine-react-table-open";
import { useNavigate } from "react-router";
import { useTherapistClientsQuery } from "../model/use-therapist-clients-query";

const columns: MRT_ColumnDef<Client>[] = [
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
];

export function TherapistClientsTable({
  therapistId,
}: {
  therapistId: number;
}) {
  const table = useServerTable();
  const navigate = useNavigate();
  const query = useTherapistClientsQuery(therapistId, table);

  return (
    <DataTable
      columns={columns}
      query={query}
      table={table}
      onRowClick={(client) => navigate(`${ROUTES.CLIENTS}/${client.id}`)}
      enableGlobalFilter={false}
    />
  );
}
