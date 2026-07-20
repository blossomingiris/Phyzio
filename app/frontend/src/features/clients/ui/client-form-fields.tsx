import {
  CLIENT_ORIGIN_LABELS,
  PREFERRED_COMMUNICATION_LABELS,
} from "@/shared/domain/client";
import { Select, SimpleGrid, TextInput } from "@mantine/core";
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
import type { ClientFormValues } from "../model/client-form-values";
import { useTherapistsQuery } from "../model/use-therapists-query";

const PREFERRED_COMMUNICATION_OPTIONS = Object.entries(
  PREFERRED_COMMUNICATION_LABELS,
).map(([value, label]) => ({ value, label }));

const CLIENT_ORIGIN_OPTIONS = Object.entries(CLIENT_ORIGIN_LABELS).map(
  ([value, label]) => ({ value, label }),
);

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
      </SimpleGrid>

      <SimpleGrid cols={2} spacing="lg">
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
        <Select
          label="Preferred Communication"
          placeholder="Select a communication channel"
          leftSection={<IconMessageCircle size={16} />}
          data={PREFERRED_COMMUNICATION_OPTIONS}
          allowDeselect={false}
          {...form.getInputProps("preferredCommunication")}
        />
        <Select
          label="Source"
          placeholder="How did they find us?"
          leftSection={<IconRoute size={16} />}
          data={CLIENT_ORIGIN_OPTIONS}
          {...form.getInputProps("origin")}
        />
      </SimpleGrid>

      <SimpleGrid cols={2} spacing="lg">
        <DateInput
          label="Birth Date"
          placeholder="Select a date"
          leftSection={<IconCake size={16} />}
          {...form.getInputProps("birthDate")}
        />
        <Select
          label="Therapist"
          placeholder="Assign a therapist"
          leftSection={<IconStethoscope size={16} />}
          data={therapistOptions}
          searchable
          clearable
          {...form.getInputProps("therapistId")}
        />
      </SimpleGrid>
    </>
  );
}
