import type { TreatmentDetail } from "@/shared/domain/treatment";
import { Button, Card, Group, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPencil } from "@tabler/icons-react";
import { TreatmentEditModal } from "./treatment-edit-modal";
import { TreatmentOverviewDetails } from "./treatment-overview-details";

export function TreatmentOverview({
  treatment,
}: {
  treatment: TreatmentDetail;
}) {
  const [editOpened, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);

  return (
    <>
      <Card withBorder shadow="md" padding="xl" maw={580} mt="10">
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
              Treatment
            </Text>
            <Button
              variant="default"
              leftSection={<IconPencil size={16} />}
              onClick={openEdit}
            >
              Edit
            </Button>
          </Group>
        </Card.Section>

        <TreatmentOverviewDetails treatment={treatment} />
      </Card>

      <TreatmentEditModal
        treatment={treatment}
        opened={editOpened}
        onClose={closeEdit}
      />
    </>
  );
}
