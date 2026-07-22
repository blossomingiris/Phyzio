import { getApiErrorMessage, isGeneralError } from "@/shared/api/errors";
import type { User } from "@/shared/domain/user";
import { WorkingHoursInput } from "@/services/working-hours";
import { Alert, Button, Card, Group, Stack, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconAlertCircle } from "@tabler/icons-react";
import {
  normalizeWorkingHoursTabFormValues,
  userToWorkingHoursFormValues,
} from "../model/settings-working-hours-form-values";
import { useUpdateProfile } from "../model/use-update-profile";

export function SettingsWorkingHoursCard({ user }: { user: User }) {
  const updateProfile = useUpdateProfile();

  const form = useForm({
    initialValues: userToWorkingHoursFormValues(user),
  });

  const handleSubmit = form.onSubmit(async (values) => {
    if (!form.isDirty()) return;

    try {
      await updateProfile.mutateAsync({
        body: normalizeWorkingHoursTabFormValues(values),
      });
      form.resetDirty();
    } catch {
      // useUpdateProfile's mutation error state already drives the alert above.
    }
  });

  return (
    <Card withBorder shadow="md" padding="xl" maw={760}>
      <Card.Section
        withBorder
        inheritPadding
        py="sm"
        mb="lg"
        bg="var(--surface-subtle)"
      >
        <Text fw={600} tt="uppercase">
          Working Hours
        </Text>
      </Card.Section>

      <form onSubmit={handleSubmit}>
        <Stack gap="lg">
          {isGeneralError(updateProfile.error) && (
            <Alert color="error" variant="light" icon={<IconAlertCircle />}>
              {getApiErrorMessage(updateProfile.error)}
            </Alert>
          )}

          <WorkingHoursInput form={form} />

          <Group justify="flex-end">
            <Button
              type="submit"
              loading={updateProfile.isPending}
              disabled={!form.isDirty()}
            >
              Save Changes
            </Button>
          </Group>
        </Stack>
      </form>
    </Card>
  );
}
