import type { ClientDetail } from "@/shared/domain/client";
import { overrideValidationMessages } from "@/shared/lib/mantine/override-validation-messages";
import type { StandardSchemaV1 } from "@standard-schema/spec";

export type ClientFormValues = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  birthDate: string | null;
  origin: NonNullable<ClientDetail["origin"]> | null;
  preferredCommunication: NonNullable<ClientDetail["preferredCommunication"]>;
  therapistId: string | null;
};

export const EMPTY_CLIENT_FORM_VALUES: ClientFormValues = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  birthDate: null,
  origin: null,
  preferredCommunication: "phone",
  therapistId: null,
};

export function clientToFormValues(client: ClientDetail): ClientFormValues {
  return {
    firstName: client.firstName,
    lastName: client.lastName,
    phone: client.phone ?? "",
    email: client.email ?? "",
    birthDate: client.birthDate ?? null,
    origin: client.origin ?? null,
    preferredCommunication: client.preferredCommunication ?? "phone",
    therapistId: client.therapist ? String(client.therapist.id) : null,
  };
}

export function normalizeClientFormValues(values: ClientFormValues) {
  return {
    firstName: values.firstName,
    lastName: values.lastName,
    phone: values.phone || undefined,
    email: values.email || undefined,
    birthDate: values.birthDate || undefined,
    origin: values.origin || undefined,
    preferredCommunication: values.preferredCommunication,
    therapistId: values.therapistId ? Number(values.therapistId) : undefined,
  };
}

export function normalizeUpdateClientFormValues(values: ClientFormValues) {
  return {
    firstName: values.firstName,
    lastName: values.lastName,
    phone: values.phone || undefined,
    email: values.email || undefined,
    birthDate: values.birthDate || undefined,
    origin: values.origin || undefined,
    preferredCommunication: values.preferredCommunication,
  };
}

const CLIENT_FIELD_MESSAGES = {
  firstName: "First name must be 1–255 characters",
  lastName: "Last name must be 1–255 characters",
  email: "Enter a valid email address",
  phone: "Phone number must be 50 characters or fewer",
};

export function validateClientForm<Values extends Record<string, unknown>>(
  schema: StandardSchemaV1<Values>,
) {
  const validate = overrideValidationMessages(
    schema,
    CLIENT_FIELD_MESSAGES as Partial<Record<keyof Values, string>>,
  );
  return (values: ClientFormValues) =>
    validate(normalizeClientFormValues(values) as unknown as Values);
}

export function validateUpdateClientForm<
  Values extends Record<string, unknown>,
>(schema: StandardSchemaV1<Values>) {
  const validate = overrideValidationMessages(
    schema,
    CLIENT_FIELD_MESSAGES as Partial<Record<keyof Values, string>>,
  );
  return (values: ClientFormValues) =>
    validate(normalizeUpdateClientFormValues(values) as unknown as Values);
}
