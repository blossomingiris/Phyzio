import { ROUTES } from "@/shared/model/routes";
import { Anchor, Button, Stack, Text, TextInput } from "@mantine/core";
import { schemaResolver, useForm } from "@mantine/form";
import { IconCircleCheck } from "@tabler/icons-react";
import { useState } from "react";
import { Link } from "react-router";
import { z } from "zod";
import { AuthLayout } from "./ui/auth-layout";

const forgotPasswordSchema = z.object({
  email: z.email("Enter a valid email"),
});

export function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  const form = useForm({
    initialValues: { email: "" },
    validate: schemaResolver(forgotPasswordSchema),
  });

  return (
    <AuthLayout
      title="Reset your password"
      description={
        !submitted && "Enter your email and we'll send you a reset link"
      }
      footer={
        <Anchor component={Link} to={ROUTES.LOGIN} size="sm" mt={15}>
          Back to login
        </Anchor>
      }
    >
      {submitted ? (
        <Stack align="center" gap="xs">
          <IconCircleCheck size={50} color="var(--mantine-color-success-6)" />
          <Text ta="center" size="sm" c="dimmed">
            If an account exists for <b>{form.values.email}</b>, you'll receive
            an email shortly.
          </Text>
          <Button
            size="sm"
            mt="md"
            onClick={() => setSubmitted(true)}
            fullWidth
          >
            Resend email
          </Button>
        </Stack>
      ) : (
        <form onSubmit={form.onSubmit(() => setSubmitted(true))}>
          <TextInput
            label="Email"
            placeholder="your@email.com"
            withAsterisk
            {...form.getInputProps("email")}
          />
          <Button type="submit" fullWidth mt="xl">
            Send reset link
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
