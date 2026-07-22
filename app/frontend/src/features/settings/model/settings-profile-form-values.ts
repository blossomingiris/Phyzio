import type { User } from "@/shared/domain/user";
import { overrideValidationMessages } from "@/shared/lib/mantine/override-validation-messages";
import type { StandardSchemaV1 } from "@standard-schema/spec";

export type ProfileFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export function userToProfileFormValues(user: User): ProfileFormValues {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.therapist?.phone ?? "",
  };
}

export function normalizeProfileFormValues(
  values: ProfileFormValues,
  isTherapist: boolean,
) {
  return {
    firstName: values.firstName,
    lastName: values.lastName,
    email: values.email,
    ...(isTherapist && { phone: values.phone }),
  };
}

const PROFILE_FIELD_MESSAGES = {
  firstName: "First name must be 1–255 characters",
  lastName: "Last name must be 1–255 characters",
  email: "Enter a valid email address",
  phone: "Phone number must be 1–50 characters",
};

export function validateProfileForm<Values extends Record<string, unknown>>(
  schema: StandardSchemaV1<Values>,
  isTherapist: boolean,
) {
  const validate = overrideValidationMessages(
    schema,
    PROFILE_FIELD_MESSAGES as Partial<Record<keyof Values, string>>,
  );
  return (values: ProfileFormValues) =>
    validate(
      normalizeProfileFormValues(values, isTherapist) as unknown as Values,
    );
}
