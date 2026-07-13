import { rqClient } from "@/shared/api/client";
import { getApiErrorMessage, isApiFieldError } from "@/shared/api/errors";
import { ROUTES } from "@/shared/model/routes";
import { Alert, Anchor, Button, PasswordInput, TextInput } from "@mantine/core";
import { schemaResolver, useForm } from "@mantine/form";
import { IconAlertCircle } from "@tabler/icons-react";
import { Link, useNavigate } from "react-router";
import { z } from "zod";
import { AuthLayout } from "./ui/auth-layout";

const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export function LoginPage() {
  const navigate = useNavigate();

  const form = useForm({
    initialValues: { email: "", password: "" },
    validate: schemaResolver(loginSchema),
    onValuesChange: () => login.reset(),
  });

  const login = rqClient.useMutation("post", "/auth/login", {
    onSuccess: (data) => {
      localStorage.setItem("phyzio-auth-token", data.token);
      navigate(ROUTES.HOME);
    },
    onError: (error) => {
      if (isApiFieldError(error)) {
        form.setErrors(
          Object.fromEntries(error.errors.map((e) => [e.field, e.message])),
        );
      }
    },
  });

  return (
    <AuthLayout
      title="Welcome back to Phyzio"
      description="Log in to continue"
      footer={
        <Anchor component={Link} to={ROUTES.FORGOT_PASSWORD} size="sm" mt={15}>
          Forgot your password?
        </Anchor>
      }
    >
      <form
        onSubmit={form.onSubmit((values) => login.mutate({ body: values }))}
      >
        {login.isError && !isApiFieldError(login.error) && (
          <Alert
            color="error"
            variant="light"
            icon={<IconAlertCircle />}
            mb="md"
          >
            {getApiErrorMessage(login.error)}
          </Alert>
        )}
        <TextInput
          label="Email"
          placeholder="your@example.email"
          withAsterisk
          {...form.getInputProps("email")}
        />
        <PasswordInput
          label="Password"
          placeholder="Your password"
          withAsterisk
          mt="md"
          {...form.getInputProps("password")}
        />
        <Button type="submit" fullWidth mt="xl" loading={login.isPending}>
          Continue
        </Button>
      </form>
    </AuthLayout>
  );
}
