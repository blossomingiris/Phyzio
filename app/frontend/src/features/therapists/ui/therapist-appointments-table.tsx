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
import { useTherapistAppointmentsQuery } from "../model/use-therapist-appointments-query";

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
    id: "client",
    header: "Client",
    enableSorting: false,
    accessorFn: (appointment) =>
      `${appointment.client.firstName} ${appointment.client.lastName}`,
  },
];

export function TherapistAppointmentsTable({
  therapistId,
}: {
  therapistId: number;
}) {
  const table = useServerTable();
  const query = useTherapistAppointmentsQuery(therapistId, table);

  return (
    <DataTable
      columns={columns}
      query={query}
      table={table}
      enableGlobalFilter={false}
    />
  );
}
