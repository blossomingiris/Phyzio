import { SPECIALITY_LABELS } from "@/shared/domain/therapist";
import { SwitchField } from "@/shared/ui/switch-field";
import {
  Alert,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  TextInput,
} from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import {
  IconAlertCircle,
  IconPhone,
  IconStethoscope,
  IconUser,
} from "@tabler/icons-react";
import type { TherapistFormValues } from "../model/therapist-form-values";

const SPECIALITY_OPTIONS = Object.entries(SPECIALITY_LABELS).map(
  ([value, label]) => ({ value, label }),
);

export function TherapistEditFormFields({
  form,
}: {
  form: UseFormReturnType<TherapistFormValues>;
}) {
  return (
    <>
      <SimpleGrid cols={2} spacing="lg">
        <TextInput
          label="First Name"
          placeholder="Jane"
          leftSection={<IconUser size={16} />}
          withAsterisk
          {...form.getInputProps("firstName")}
        />
        <TextInput
          label="Last Name"
          placeholder="Doe"
          leftSection={<IconUser size={16} />}
          withAsterisk
          {...form.getInputProps("lastName")}
        />
        <Select
          label="Speciality"
          placeholder="Select a speciality"
          leftSection={<IconStethoscope size={16} />}
          data={SPECIALITY_OPTIONS}
          allowDeselect={false}
          withAsterisk
          {...form.getInputProps("speciality")}
        />
        <TextInput
          label="Phone"
          placeholder="+1 234 567 8900"
          leftSection={<IconPhone size={16} />}
          withAsterisk
          {...form.getInputProps("phone")}
        />
      </SimpleGrid>

      <Paper withBorder radius="md" p="md">
        <Stack gap="md">
          <SwitchField
            label="Accepting new appointments"
            size="lg"
            {...form.getInputProps("isActive", { type: "checkbox" })}
          />

          {form.values.isActive && (
            <Alert color="error" icon={<IconAlertCircle />}>
              Turning this off marks the therapist unavailable: their
              in-progress treatment plans are automatically paused, and their
              clients may need to be reassigned.
            </Alert>
          )}
        </Stack>
      </Paper>
    </>
  );
}
