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
  preferredCommunication: ClientDetail["preferredCommunication"];
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
    preferredCommunication: client.preferredCommunication,
    therapistId: client.therapist ? String(client.therapist.id) : null,
  };
}

/**
 * Optional fields are blank as `""`/`null` while editing, but the API
 * schemas treat blank as "provide a valid value" rather than "omit this
 * field" (e.g. `phone` is `min(1).optional()`) — convert blanks to
 * `undefined` so they're dropped from the request instead of failing
 * validation.
 */
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

/**
 * Replaces raw zod messages (e.g. "Too small: expected string to have
 * >=1 characters", "Too big: expected string to have <=255 characters",
 * "Invalid email address") with copy that reads naturally in the form.
 * One message per field, covering every way that field can be invalid —
 * `overrideValidationMessages` only replaces by field name, not by which
 * rule failed.
 */
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
