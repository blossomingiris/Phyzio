import {
  APPOINTMENT_STATUS_COLORS,
  APPOINTMENT_STATUS_LABELS,
  type Appointment,
} from "@/shared/domain/appointment";
import { formatDateTime } from "@/shared/lib/date/format-date";
import { DataTable } from "@/shared/ui/data-table/data-table";
import { useServerTable } from "@/shared/ui/data-table/use-server-table";
import { Badge } from "@mantine/core";
import type { MRT_ColumnDef } from "mantine-react-table-open";
import { useClientAppointmentsQuery } from "../model/use-client-appointments-query";

const columns: MRT_ColumnDef<Appointment>[] = [
  {
    accessorKey: "startedAt",
    header: "Started",
    Cell: ({ cell }) => formatDateTime(cell.getValue<string>()),
  },
  {
    accessorKey: "endedAt",
    header: "Ended",
    enableSorting: false,
    Cell: ({ cell }) => formatDateTime(cell.getValue<string>()),
  },
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: false,
    Cell: ({ cell }) => {
      const status = cell.getValue<Appointment["status"]>();
      return (
        <Badge color={APPOINTMENT_STATUS_COLORS[status]} variant="light">
          {APPOINTMENT_STATUS_LABELS[status]}
        </Badge>
      );
    },
  },
  {
    id: "therapist",
    header: "Therapist",
    enableSorting: false,
    accessorFn: (appointment) =>
      appointment.therapist
        ? `${appointment.therapist.firstName} ${appointment.therapist.lastName}`
        : "—",
  },
];

export function ClientAppointmentsTable({ clientId }: { clientId: number }) {
  const table = useServerTable();
  const query = useClientAppointmentsQuery(clientId, table);

  return (
    <DataTable
      columns={columns}
      query={query}
      table={table}
      enableGlobalFilter={false}
    />
  );
}
