import type { AdminUser } from "@/shared/domain/user";
import { overrideValidationMessages } from "@/shared/lib/mantine/override-validation-messages";
import type { StandardSchemaV1 } from "@standard-schema/spec";

export type UserFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export const EMPTY_USER_FORM_VALUES: UserFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
};

export function userToFormValues(user: AdminUser): UserFormValues {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    password: "",
  };
}

export function normalizeCreateUserFormValues(values: UserFormValues) {
  return {
    firstName: values.firstName,
    lastName: values.lastName,
    email: values.email,
    password: values.password,
    role: "admin" as const,
  };
}

export function normalizeUpdateUserFormValues(values: UserFormValues) {
  return {
    firstName: values.firstName,
    lastName: values.lastName,
    email: values.email,
  };
}

const USER_FIELD_MESSAGES = {
  firstName: "First name must be 1–255 characters",
  lastName: "Last name must be 1–255 characters",
  email: "Enter a valid email address",
  password:
    "Password must be at least 8 characters with an uppercase letter, a lowercase letter, and a digit",
};

export function validateCreateUserForm<
  Values extends Record<string, unknown>,
>(schema: StandardSchemaV1<Values>) {
  const validate = overrideValidationMessages(
    schema,
    USER_FIELD_MESSAGES as Partial<Record<keyof Values, string>>,
  );
  return (values: UserFormValues) =>
    validate(normalizeCreateUserFormValues(values) as unknown as Values);
}

export function validateUpdateUserForm<
  Values extends Record<string, unknown>,
>(schema: StandardSchemaV1<Values>) {
  const validate = overrideValidationMessages(
    schema,
    USER_FIELD_MESSAGES as Partial<Record<keyof Values, string>>,
  );
  return (values: UserFormValues) =>
    validate(normalizeUpdateUserFormValues(values) as unknown as Values);
}
