import type { Therapist } from "@/shared/domain/therapist";
import { useConfirmation } from "@/shared/lib/confirmation/use-confirmation";
import { ActionIcon, Card, Group, Menu, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconDotsVertical, IconPencil, IconTrash } from "@tabler/icons-react";
import { useDeleteTherapist } from "../model/use-delete-therapist";
import { TherapistEditModal } from "./therapist-edit-modal";
import { TherapistOverviewDetails } from "./therapist-overview-details";

export function TherapistOverview({ therapist }: { therapist: Therapist }) {
  const [editOpened, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);
  const isDeleted = !!therapist.deletedAt;

  const confirm = useConfirmation();
  const deleteTherapist = useDeleteTherapist();

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: "Delete Therapist",
      description: (
        <>
          Are you sure you want to delete{" "}
          <Text span fw={600}>
            {therapist.firstName} {therapist.lastName}
          </Text>
          ? This action cannot be undone.
        </>
      ),
      confirmLabel: "Delete Therapist",
      confirmVariant: "destructive",
    });
    if (!confirmed) return;

    deleteTherapist.mutate({ params: { path: { id: therapist.id } } });
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
              Therapist Details
            </Text>
            {!isDeleted && (
              <Menu
                position="right-start"
                withArrow
                styles={{ item: { minHeight: 44 } }}
              >
                <Menu.Target>
                  <ActionIcon
                    variant="default"
                    radius="md"
                    size={44}
                    aria-label="Therapist actions"
                  >
                    <IconDotsVertical size={20} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<IconPencil size={16} />}
                    onClick={openEdit}
                  >
                    Edit
                  </Menu.Item>
                  <Menu.Item
                    color="error"
                    leftSection={<IconTrash size={16} />}
                    onClick={handleDelete}
                  >
                    Delete
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            )}
          </Group>
        </Card.Section>

        <TherapistOverviewDetails therapist={therapist} />
      </Card>

      <TherapistEditModal
        therapist={therapist}
        opened={editOpened}
        onClose={closeEdit}
      />
    </>
  );
}
