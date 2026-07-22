import { overrideValidationMessages } from "@/shared/lib/mantine/override-validation-messages";
import type { StandardSchemaV1 } from "@standard-schema/spec";

export type PasswordFormValues = {
  currentPassword: string;
  newPassword: string;
};

export const EMPTY_PASSWORD_FORM_VALUES: PasswordFormValues = {
  currentPassword: "",
  newPassword: "",
};

const PASSWORD_FIELD_MESSAGES = {
  currentPassword: "Enter your current password",
  newPassword:
    "Password must be at least 8 characters with an uppercase letter, a lowercase letter, and a digit",
};

export function validatePasswordForm<Values extends Record<string, unknown>>(
  schema: StandardSchemaV1<Values>,
) {
  const validate = overrideValidationMessages(
    schema,
    PASSWORD_FIELD_MESSAGES as Partial<Record<keyof Values, string>>,
  );
  return (values: PasswordFormValues) => validate(values as unknown as Values);
}
