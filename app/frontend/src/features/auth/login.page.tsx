import { getApiErrorMessage, isGeneralError } from "@/shared/api/errors";
import { postAuthLogin } from "@/shared/api/generated/validation-schemas";
import { applyApiFieldErrors } from "@/shared/lib/mantine/apply-api-field-errors";
import { ROUTES } from "@/shared/model/routes";
import { Alert, Anchor, Button, PasswordInput, TextInput } from "@mantine/core";
import { schemaResolver, useForm } from "@mantine/form";
import { IconAlertCircle } from "@tabler/icons-react";
import { Link } from "react-router";
import { useLogin } from "./use-login";
import { AuthLayout } from "./ui/auth-layout";

export function LoginPage() {
  const login = useLogin();

  const form = useForm({
    initialValues: { email: "", password: "" },
    validate: schemaResolver(postAuthLogin),
    onValuesChange: () => login.reset(),
  });

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      await login.mutateAsync(values);
    } catch (error) {
      applyApiFieldErrors(form, error);
    }
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
      <form onSubmit={handleSubmit}>
        {isGeneralError(login.error) && (
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
