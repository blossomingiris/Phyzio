import { useBreadcrumb } from "@/shared/lib/react/use-breadcrumb";
import { ROUTES } from "@/shared/model/routes";
import { BackButton } from "@/shared/ui/back-button";
import { Stack, Title } from "@mantine/core";

export function TreatmentItemPage() {
  useBreadcrumb("Treatment");

  return (
    <Stack gap="sm" align="flex-start">
      <BackButton to={ROUTES.TREATMENTS} />
      <Title>Treatment</Title>
    </Stack>
  );
}
