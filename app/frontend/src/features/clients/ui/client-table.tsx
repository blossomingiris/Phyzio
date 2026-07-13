import { rqClient } from "@/shared/api/client";
import { ROUTES } from "@/shared/model/routes";
import { Group, Pagination, Stack, Table, Text } from "@mantine/core";
import type { MethodResponse } from "openapi-react-query";
import { useNavigate } from "react-router";

type ClientListResponse = MethodResponse<
  typeof rqClient,
  "get",
  "/clients/"
>;
type Client = ClientListResponse["data"][number];

export function ClientTable({
  clients,
  page,
  totalPages,
  onPageChange,
}: {
  clients: Client[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const navigate = useNavigate();

  return (
    <Stack>
      <Table highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Phone</Table.Th>
            <Table.Th>Email</Table.Th>
            <Table.Th>Therapist</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {clients.map((client) => (
            <Table.Tr
              key={client.id}
              onClick={() => navigate(`${ROUTES.CLIENTS}/${client.id}`)}
              style={{ cursor: "pointer" }}
            >
              <Table.Td>
                {client.firstName} {client.lastName}
              </Table.Td>
              <Table.Td>{client.phone ?? "—"}</Table.Td>
              <Table.Td>{client.email ?? "—"}</Table.Td>
              <Table.Td>
                {client.therapist
                  ? `${client.therapist.firstName} ${client.therapist.lastName}`
                  : "—"}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      {clients.length === 0 && (
        <Text c="dimmed" ta="center">
          No clients found
        </Text>
      )}
      {totalPages > 1 && (
        <Group justify="center">
          <Pagination value={page} onChange={onPageChange} total={totalPages} />
        </Group>
      )}
    </Stack>
  );
}
