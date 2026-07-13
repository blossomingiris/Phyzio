import { useBreadcrumb } from "@/shared/lib/react/use-breadcrumb";
import { ROUTES } from "@/shared/model/routes";
import { BackButton } from "@/shared/ui/back-button";
import { Stack, Title } from "@mantine/core";

export function TherapistItemPage() {
  useBreadcrumb("Therapist");

  return (
    <Stack gap="sm" align="flex-start">
      <BackButton to={ROUTES.THERAPISTS} />
      <Title>Therapist</Title>
    </Stack>
  );
}
