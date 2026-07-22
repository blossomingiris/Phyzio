import type { TreatmentPlanDetail } from "@/shared/domain/treatment-plan";
import { CardActionsMenu } from "@/shared/ui/card-actions-menu";
import { Card, Group, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconBan, IconPencil } from "@tabler/icons-react";
import { TreatmentPlanCancelModal } from "./treatment-plan-cancel-modal";
import { TreatmentPlanEditModal } from "./treatment-plan-edit-modal";
import { TreatmentPlanOverviewDetails } from "./treatment-plan-overview-details";

const TERMINAL_STATUSES: TreatmentPlanDetail["status"][] = [
  "completed",
  "cancelled",
];

export function TreatmentPlanOverview({ plan }: { plan: TreatmentPlanDetail }) {
  const [editOpened, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);
  const [cancelOpened, { open: openCancel, close: closeCancel }] =
    useDisclosure(false);

  const isTerminal = TERMINAL_STATUSES.includes(plan.status);

  return (
    <>
      <Card withBorder shadow="md" padding="md" maw={700}>
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
              Treatment Plan Details
            </Text>
            {!isTerminal && (
              <CardActionsMenu
                label="Treatment plan actions"
                actions={[
                  { label: "Edit", icon: IconPencil, onClick: openEdit },
                  {
                    label: "Cancel Plan",
                    icon: IconBan,
                    onClick: openCancel,
                    color: "error",
                  },
                ]}
              />
            )}
          </Group>
        </Card.Section>

        <TreatmentPlanOverviewDetails plan={plan} />
      </Card>

      <TreatmentPlanEditModal
        plan={plan}
        opened={editOpened}
        onClose={closeEdit}
      />

      <TreatmentPlanCancelModal
        planId={plan.id}
        opened={cancelOpened}
        onClose={closeCancel}
      />
    </>
  );
}
