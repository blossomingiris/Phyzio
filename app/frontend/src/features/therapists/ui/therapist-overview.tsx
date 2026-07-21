import type { Therapist } from "@/shared/domain/therapist";
import { ActionIcon, Card, Group, Menu, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconDotsVertical, IconPencil, IconTrash } from "@tabler/icons-react";
import { TherapistDeleteModal } from "./therapist-delete-modal";
import { TherapistEditModal } from "./therapist-edit-modal";
import { TherapistOverviewDetails } from "./therapist-overview-details";

export function TherapistOverview({ therapist }: { therapist: Therapist }) {
  const [editOpened, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] =
    useDisclosure(false);
  const isDeleted = !!therapist.deletedAt;

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
                    onClick={openDelete}
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

      <TherapistDeleteModal
        therapist={therapist}
        opened={deleteOpened}
        onClose={closeDelete}
      />
    </>
  );
}
