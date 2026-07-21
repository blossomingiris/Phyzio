import {
  SPECIALITY_ICONS,
  SPECIALITY_LABELS,
  type Therapist,
} from "@/shared/domain/therapist";
import { formatDate } from "@/shared/lib/date/format-date";
import { ROUTES } from "@/shared/model/routes";
import { DataTable } from "@/shared/ui/data-table/data-table";
import type { ServerTableState } from "@/shared/ui/data-table/use-server-table";
import { Badge, Group } from "@mantine/core";
import type { MRT_ColumnDef } from "mantine-react-table-open";
import { useMemo, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { useTherapistsListQuery } from "../model/use-therapists-list-query";

const baseColumns: MRT_ColumnDef<Therapist>[] = [
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
    accessorKey: "phone",
    header: "Phone",
    enableSorting: false,
    Cell: ({ cell, row }) =>
      row.original.deletedAt ? "—" : cell.getValue<string>(),
  },
  {
    accessorKey: "speciality",
    header: "Speciality",
    enableSorting: false,
    Cell: ({ cell, row }) => {
      if (row.original.deletedAt) return "—";
      const speciality = cell.getValue<Therapist["speciality"]>();
      const SpecialityIcon = SPECIALITY_ICONS[speciality];
      return (
        <Group gap={6} wrap="nowrap">
          <SpecialityIcon
            size={16}
            stroke={1.5}
            color="var(--mantine-color-dimmed)"
          />
          {SPECIALITY_LABELS[speciality]}
        </Group>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Availability",
    enableSorting: false,
    Cell: ({ cell, row }) => {
      if (row.original.deletedAt) return "—";
      return cell.getValue<boolean>() ? (
        <Badge color="success" variant="light">
          Available
        </Badge>
      ) : (
        <Badge color="accent" variant="light">
          Unavailable
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

const deletedAtColumn: MRT_ColumnDef<Therapist> = {
  accessorKey: "deletedAt",
  header: "Deleted",
  enableSorting: false,
  Cell: ({ cell }) => formatDate(cell.getValue<string | null>()),
};

const statusColumn: MRT_ColumnDef<Therapist> = {
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

export function TherapistTable({
  table,
  status,
  speciality,
  isActive,
  toolbarActions,
}: {
  table: ServerTableState;
  status: "active" | "all" | "deleted";
  speciality?: Therapist["speciality"];
  isActive?: boolean;
  toolbarActions?: ReactNode;
}) {
  const navigate = useNavigate();
  const query = useTherapistsListQuery(table, status, speciality, isActive);
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
      onRowClick={(therapist) => navigate(`${ROUTES.THERAPISTS}/${therapist.id}`)}
      renderTopToolbarCustomActions={toolbarActions}
    />
  );
}
