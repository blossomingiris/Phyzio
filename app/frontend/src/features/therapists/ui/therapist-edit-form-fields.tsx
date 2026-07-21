import { SPECIALITY_LABELS } from "@/shared/domain/therapist";
import { SwitchField } from "@/shared/ui/switch-field";
import { Divider, Select, SimpleGrid, TextInput } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import { IconPhone, IconStethoscope, IconUser } from "@tabler/icons-react";
import type { TherapistFormValues } from "../model/therapist-form-values";
import { TherapistWorkingHoursInput } from "./therapist-working-hours-input";

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

      <SwitchField
        label="Accepting new appointments"
        color="success"
        {...form.getInputProps("isActive", { type: "checkbox" })}
      />

      <Divider />

      <TherapistWorkingHoursInput form={form} />
    </>
  );
}
