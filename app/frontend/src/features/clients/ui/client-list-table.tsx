import type { ServerTableState } from "@/shared/ui/data-table/use-server-table";
import { useClientsQuery } from "../use-clients-query";
import { ClientTable } from "./client-table";

export function ClientListTable({
  table,
  deleted,
}: {
  table: ServerTableState;
  deleted: boolean;
}) {
  const query = useClientsQuery(table, deleted);
  return <ClientTable query={query} table={table} />;
}
