import {
  TREATMENT_PLAN_STATUS_COLORS,
  TREATMENT_PLAN_STATUS_LABELS,
} from "@/shared/domain/treatment-plan";
import { useBreadcrumb } from "@/shared/lib/react/use-breadcrumb";
import { ROUTES } from "@/shared/model/routes";
import { AsyncWrapper } from "@/shared/ui/async-wrapper";
import { BackButton } from "@/shared/ui/back-button";
import { Badge, Group, Stack, Title } from "@mantine/core";
import { useParams } from "react-router";
import { useTreatmentPlanQuery } from "./model/use-treatment-plan-query";
import { TreatmentPlanOverview } from "./ui/treatment-plan-overview";

export function TreatmentPlanItemPage() {
  const { id } = useParams<{ id: string }>();
  const query = useTreatmentPlanQuery(id!);
  const plan = query.data;

  useBreadcrumb(plan ? `Treatment Plan #${plan.id}` : "Treatment Plan");

  return (
    <Stack gap="sm" align="flex-start" style={{ width: "100%" }}>
      <BackButton to={ROUTES.TREATMENT_PLANS} />
      <Group gap="xs">
        <Title>{plan ? `Treatment Plan #${plan.id}` : "Treatment Plan"}</Title>
        {plan && (
          <Badge color={TREATMENT_PLAN_STATUS_COLORS[plan.status]} variant="light">
            {TREATMENT_PLAN_STATUS_LABELS[plan.status]}
          </Badge>
        )}
      </Group>
      <AsyncWrapper
        query={query}
        errorMessage="Treatment plan not found"
        render={(plan) => <TreatmentPlanOverview plan={plan} />}
      />
    </Stack>
  );
}
