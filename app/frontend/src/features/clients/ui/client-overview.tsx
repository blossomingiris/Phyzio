import type { ClientDetail } from "@/shared/domain/client";
import { useConfirmation } from "@/shared/lib/confirmation/use-confirmation";
import { CardActionsMenu } from "@/shared/ui/card-actions-menu";
import { Card, Group, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import { useDeleteClient } from "../model/use-delete-client";
import { ClientEditModal } from "./client-edit-modal";
import { ClientOverviewDetails } from "./client-overview-details";

export function ClientOverview({ client }: { client: ClientDetail }) {
  const [editOpened, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);
  const isDeleted = !!client.deletedAt;

  const confirm = useConfirmation();
  const deleteClient = useDeleteClient();

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: "Delete Client",
      description: (
        <>
          Are you sure you want to delete{" "}
          <Text span fw={600}>
            {client.firstName} {client.lastName}
          </Text>
          ? This action cannot be undone.
        </>
      ),
      confirmLabel: "Delete Client",
      confirmVariant: "destructive",
    });
    if (!confirmed) return;

    deleteClient.mutate({ params: { path: { id: client.id } } });
  };

  return (
    <>
      <Card withBorder shadow="md" padding="xl" maw={580}>
        <Card.Section
          withBorder
          inheritPadding
          py="sm"
          mb="lg"
          pr="sm"
          bg="var(--surface-subtle)"
        >
          <Group justify="space-between">
            <Text fw={600} tt="uppercase">
              Client Details
            </Text>
            {!isDeleted && (
              <CardActionsMenu
                label="Client actions"
                actions={[
                  { label: "Edit", icon: IconPencil, onClick: openEdit },
                  {
                    label: "Delete",
                    icon: IconTrash,
                    onClick: handleDelete,
                    color: "error",
                  },
                ]}
              />
            )}
          </Group>
        </Card.Section>

        <ClientOverviewDetails client={client} />
      </Card>

      <ClientEditModal
        client={client}
        opened={editOpened}
        onClose={closeEdit}
      />
    </>
  );
}
