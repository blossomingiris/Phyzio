import type { ClientDetail } from "@/shared/domain/client";
import { overrideValidationMessages } from "@/shared/lib/mantine/override-validation-messages";
import type { StandardSchemaV1 } from "@standard-schema/spec";

export type ClientTherapistFormValues = {
  therapistId: string | null;
};

export function clientToTherapistFormValues(
  client: ClientDetail,
): ClientTherapistFormValues {
  return { therapistId: client.therapist ? String(client.therapist.id) : null };
}

export function normalizeClientTherapistFormValues(
  values: ClientTherapistFormValues,
) {
  return {
    therapistId: values.therapistId ? Number(values.therapistId) : undefined,
  };
}

export function validateClientTherapistForm<
  Values extends Record<string, unknown>,
>(schema: StandardSchemaV1<Values>) {
  const validate = overrideValidationMessages(
    schema,
    {} as Partial<Record<keyof Values, string>>,
  );
  return (values: ClientTherapistFormValues) =>
    validate(normalizeClientTherapistFormValues(values) as unknown as Values);
}
