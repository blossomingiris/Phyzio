import { SimpleGrid, TextInput } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import { IconMail, IconUser } from "@tabler/icons-react";
import type { UserFormValues } from "../model/user-form-values";

export function UserEditFormFields({
  form,
}: {
  form: UseFormReturnType<UserFormValues>;
}) {
  return (
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
      <TextInput
        label="Email"
        placeholder="jane.doe@example.com"
        leftSection={<IconMail size={16} />}
        withAsterisk
        {...form.getInputProps("email")}
      />
    </SimpleGrid>
  );
}
