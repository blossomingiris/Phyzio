import { generatePassword } from "@/shared/lib/generate-password";
import { ROUTES } from "@/shared/model/routes";
import {
  Anchor,
  Button,
  PasswordInput,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import { IconLock, IconMail, IconUser, IconWand } from "@tabler/icons-react";
import { Link } from "react-router";
import type { UserFormValues } from "../model/user-form-values";

export function UserCreateFormFields({
  form,
}: {
  form: UseFormReturnType<UserFormValues>;
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

      <Text size="sm" c="dimmed">
        Need to add a therapist? Create one from the{" "}
        <Anchor component={Link} to={ROUTES.THERAPISTS} size="sm">
          Therapists
        </Anchor>{" "}
        page.
      </Text>
    </>
  );
}
