import {
  CLIENT_ORIGIN_LABELS,
  PREFERRED_COMMUNICATION_LABELS,
} from "@/shared/domain/client";
import { Select, SimpleGrid, Stack, TextInput } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import type { UseFormReturnType } from "@mantine/form";
import {
  IconCake,
  IconMail,
  IconMessageCircle,
  IconPhone,
  IconRoute,
  IconStethoscope,
  IconUser,
} from "@tabler/icons-react";
import type { ReactNode } from "react";
import type { ClientFormValues } from "../model/client-form-values";
import { useTherapistsQuery } from "../model/use-therapists-query";

const PREFERRED_COMMUNICATION_OPTIONS = Object.entries(
  PREFERRED_COMMUNICATION_LABELS,
).map(([value, label]) => ({ value, label }));

const CLIENT_ORIGIN_OPTIONS = Object.entries(CLIENT_ORIGIN_LABELS).map(
  ([value, label]) => ({ value, label }),
);

function FieldGroup({
  cols,
  children,
}: {
  cols: 1 | 2 | 3;
  children: ReactNode;
}) {
  return (
    <Stack gap="xs">
      <SimpleGrid cols={cols} spacing="lg">
        {children}
      </SimpleGrid>
    </Stack>
  );
}

export function ClientFormFields({
  form,
}: {
  form: UseFormReturnType<ClientFormValues>;
}) {
  const { data } = useTherapistsQuery();
  const therapistOptions = (data?.data ?? []).map((therapist) => ({
    value: String(therapist.id),
    label: therapist.isActive
      ? `${therapist.firstName} ${therapist.lastName}`
      : `${therapist.firstName} ${therapist.lastName} (Unavailable)`,
    disabled: !therapist.isActive,
  }));

  return (
    <>
      <FieldGroup cols={2}>
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
      </FieldGroup>

      <FieldGroup cols={2}>
        <TextInput
          label="Phone"
          placeholder="+1 234 567 8900"
          leftSection={<IconPhone size={16} />}
          {...form.getInputProps("phone")}
        />
        <TextInput
          label="Email"
          placeholder="jane.doe@example.com"
          leftSection={<IconMail size={16} />}
          {...form.getInputProps("email")}
        />
      </FieldGroup>

      <FieldGroup cols={3}>
        <DateInput
          label="Birth Date"
          placeholder="Select a date"
          leftSection={<IconCake size={16} />}
          {...form.getInputProps("birthDate")}
        />
        <Select
          label="How they find us"
          placeholder="Select a source"
          leftSection={<IconRoute size={16} />}
          data={CLIENT_ORIGIN_OPTIONS}
          {...form.getInputProps("origin")}
        />
        <Select
          label="Preferred Communication"
          placeholder="Select a communication channel"
          leftSection={<IconMessageCircle size={16} />}
          data={PREFERRED_COMMUNICATION_OPTIONS}
          allowDeselect={false}
          {...form.getInputProps("preferredCommunication")}
        />
      </FieldGroup>

      {/* Two columns for a single field so it takes half the width and lines
          up with the first column of the groups above. */}
      <FieldGroup cols={2}>
        <Select
          label="Therapist"
          placeholder="Assign a therapist"
          leftSection={<IconStethoscope size={16} />}
          data={therapistOptions}
          searchable
          clearable
          {...form.getInputProps("therapistId")}
        />
      </FieldGroup>
    </>
  );
}
