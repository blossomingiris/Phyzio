import { useBreadcrumb } from "@/shared/lib/react/use-breadcrumb";
import { ROUTES } from "@/shared/model/routes";
import { BackButton } from "@/shared/ui/back-button";
import { Stack, Title } from "@mantine/core";

export function TreatmentPlanItemPage() {
  useBreadcrumb("Treatment Plan");

  return (
    <Stack gap="sm" align="flex-start">
      <BackButton to={ROUTES.TREATMENT_PLANS} />
      <Title>Treatment Plan</Title>
    </Stack>
  );
}
