import { SPECIALITY_LABELS } from "@/shared/domain/therapist";
import {
  Button,
  PasswordInput,
  Select,
  SimpleGrid,
  Stack,
  TextInput,
} from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import {
  IconLock,
  IconMail,
  IconPhone,
  IconStethoscope,
  IconUser,
  IconWand,
} from "@tabler/icons-react";
import type { TherapistFormValues } from "../model/therapist-form-values";
import { TherapistWorkingHoursInput } from "./therapist-working-hours-input";

const SPECIALITY_OPTIONS = Object.entries(SPECIALITY_LABELS).map(
  ([value, label]) => ({ value, label }),
);

const PASSWORD_LOWER = "abcdefghijkmnpqrstuvwxyz";
const PASSWORD_UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const PASSWORD_DIGITS = "23456789";

function generatePassword(length = 14): string {
  const all = PASSWORD_LOWER + PASSWORD_UPPER + PASSWORD_DIGITS;
  const pick = (chars: string) =>
    chars[Math.floor(Math.random() * chars.length)]!;

  const chars = [
    pick(PASSWORD_LOWER),
    pick(PASSWORD_UPPER),
    pick(PASSWORD_DIGITS),
  ];
  while (chars.length < length) chars.push(pick(all));

  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j]!, chars[i]!];
  }

  return chars.join("");
}

export function TherapistCreateFormFields({
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
        <TextInput
          label="Email"
          placeholder="jane.doe@example.com"
          leftSection={<IconMail size={16} />}
          withAsterisk
          {...form.getInputProps("email")}
        />
        <Stack gap={4}>
          <PasswordInput
            label="Password"
            placeholder="password123Aa"
            inputWrapperOrder={["label", "input", "description", "error"]}
            description={
              form.errors["password"]
                ? ""
                : "Minimum 8 characters with at least one uppercase letter, one lowercase letter, and one number."
            }
            leftSection={<IconLock size={16} />}
            visible
            withAsterisk
            {...form.getInputProps("password")}
          />
          <Button
            variant="subtle"
            leftSection={<IconWand size={16} />}
            onClick={() => form.setFieldValue("password", generatePassword())}
            style={{ alignSelf: "flex-end" }}
          >
            Generate Password
          </Button>
        </Stack>
      </SimpleGrid>
      <TherapistWorkingHoursInput form={form} />
    </>
  );
}
