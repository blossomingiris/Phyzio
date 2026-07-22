import {
  getTreatmentPlanProgress,
  getTreatmentPlanProgressColor,
  type TreatmentPlan,
} from "@/shared/domain/treatment-plan";
import { Progress, Stack, Text } from "@mantine/core";

export function TreatmentPlanProgressCell({ plan }: { plan: TreatmentPlan }) {
  const { total, completed, left } = getTreatmentPlanProgress(plan);

  if (total === 0) {
    return (
      <Text size="xs" c="dimmed">
        No items
      </Text>
    );
  }

  const percent = (completed / total) * 100;

  return (
    <Stack gap={4} miw={140}>
      <Progress
        value={percent}
        color={getTreatmentPlanProgressColor(percent)}
        size="md"
        styles={{ root: { border: "1px solid var(--mantine-color-gray-4)" } }}
      />
      <Text size="xs" c="dimmed">
        {completed}/{total} sessions · {left} left
      </Text>
    </Stack>
  );
}
