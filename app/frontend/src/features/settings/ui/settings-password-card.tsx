import { getApiErrorMessage, isGeneralError } from "@/shared/api/errors";
import { patchMePassword } from "@/shared/api/generated/validation-schemas";
import { applyApiFieldErrors } from "@/shared/lib/mantine/apply-api-field-errors";
import {
  Alert,
  Button,
  Card,
  Group,
  PasswordInput,
  Stack,
  Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconAlertCircle, IconLock } from "@tabler/icons-react";
import {
  EMPTY_PASSWORD_FORM_VALUES,
  validatePasswordForm,
} from "../model/settings-password-form-values";
import { useUpdatePassword } from "../model/use-update-password";

export function SettingsPasswordCard() {
  const updatePassword = useUpdatePassword();

  const form = useForm({
    initialValues: EMPTY_PASSWORD_FORM_VALUES,
    validate: validatePasswordForm(patchMePassword),
  });

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      await updatePassword.mutateAsync({ body: values });
      form.reset();
    } catch (error) {
      applyApiFieldErrors(form, error);
    }
  });

  return (
    <Card withBorder shadow="md" padding="xl" maw={580}>
      <Card.Section
        withBorder
        inheritPadding
        py="sm"
        mb="lg"
        bg="var(--surface-subtle)"
      >
        <Text fw={600} tt="uppercase">
          Password
        </Text>
      </Card.Section>

      <form onSubmit={handleSubmit}>
        <Stack gap="lg">
          {isGeneralError(updatePassword.error) && (
            <Alert color="error" variant="light" icon={<IconAlertCircle />}>
              {getApiErrorMessage(updatePassword.error)}
            </Alert>
          )}

          <PasswordInput
            label="Current Password"
            leftSection={<IconLock size={16} />}
            withAsterisk
            {...form.getInputProps("currentPassword")}
          />
          <PasswordInput
            label="New Password"
            inputWrapperOrder={["label", "input", "description", "error"]}
            description={
              form.errors["newPassword"]
                ? ""
                : "Minimum 8 characters with at least one uppercase letter, one lowercase letter, and one number."
            }
            leftSection={<IconLock size={16} />}
            withAsterisk
            {...form.getInputProps("newPassword")}
          />

          <Group justify="flex-end">
            <Button type="submit" loading={updatePassword.isPending}>
              Change Password
            </Button>
          </Group>
        </Stack>
      </form>
    </Card>
  );
}
