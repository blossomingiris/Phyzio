import type { Therapist } from "@/shared/domain/therapist";
import { CardActionsMenu } from "@/shared/ui/card-actions-menu";
import { Card, Group, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPencil, IconTrash } from "@tabler/icons-react";
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
              <CardActionsMenu
                label="Therapist actions"
                actions={[
                  { label: "Edit", icon: IconPencil, onClick: openEdit },
                  {
                    label: "Delete",
                    icon: IconTrash,
                    onClick: openDelete,
                    color: "error",
                  },
                ]}
              />
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
