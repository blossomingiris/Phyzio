import { getApiErrorMessage, isGeneralError } from "@/shared/api/errors";
import { patchMe } from "@/shared/api/generated/validation-schemas";
import type { User } from "@/shared/domain/user";
import { applyApiFieldErrors } from "@/shared/lib/mantine/apply-api-field-errors";
import {
  Alert,
  Button,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconAlertCircle, IconMail, IconPhone, IconUser } from "@tabler/icons-react";
import {
  normalizeProfileFormValues,
  userToProfileFormValues,
  validateProfileForm,
} from "../model/settings-profile-form-values";
import { useUpdateProfile } from "../model/use-update-profile";

export function SettingsProfileCard({ user }: { user: User }) {
  const isTherapist = !!user.therapist;
  const updateProfile = useUpdateProfile();

  const form = useForm({
    initialValues: userToProfileFormValues(user),
    validate: validateProfileForm(patchMe, isTherapist),
  });

  const handleSubmit = form.onSubmit(async (values) => {
    if (!form.isDirty()) return;

    try {
      await updateProfile.mutateAsync({
        body: normalizeProfileFormValues(values, isTherapist),
      });
      form.resetDirty();
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
          Profile
        </Text>
      </Card.Section>

      <form onSubmit={handleSubmit}>
        <Stack gap="lg">
          {isGeneralError(updateProfile.error) && (
            <Alert color="error" variant="light" icon={<IconAlertCircle />}>
              {getApiErrorMessage(updateProfile.error)}
            </Alert>
          )}

          <SimpleGrid cols={2} spacing="lg">
            <TextInput
              label="First Name"
              leftSection={<IconUser size={16} />}
              withAsterisk
              {...form.getInputProps("firstName")}
            />
            <TextInput
              label="Last Name"
              leftSection={<IconUser size={16} />}
              withAsterisk
              {...form.getInputProps("lastName")}
            />
            <TextInput
              label="Email"
              leftSection={<IconMail size={16} />}
              withAsterisk
              {...form.getInputProps("email")}
            />
            {isTherapist && (
              <TextInput
                label="Phone"
                leftSection={<IconPhone size={16} />}
                withAsterisk
                {...form.getInputProps("phone")}
              />
            )}
          </SimpleGrid>

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
