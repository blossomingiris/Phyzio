import type { Therapist } from "@/shared/domain/therapist";
import {
  normalizeWorkingHours,
  workingHoursToFormValues,
  type WorkingHoursFormValues,
} from "@/services/working-hours";
import { overrideValidationMessages } from "@/shared/lib/mantine/override-validation-messages";
import type { StandardSchemaV1 } from "@standard-schema/spec";

export type TherapistWorkingHoursFormValues = {
  workingHours: WorkingHoursFormValues;
};

export function therapistToWorkingHoursFormValues(
  therapist: Therapist,
): TherapistWorkingHoursFormValues {
  return { workingHours: workingHoursToFormValues(therapist.workingHours) };
}

export function normalizeTherapistWorkingHoursFormValues(
  values: TherapistWorkingHoursFormValues,
) {
  return { workingHours: normalizeWorkingHours(values.workingHours) };
}

export function validateTherapistWorkingHoursForm<
  Values extends Record<string, unknown>,
>(schema: StandardSchemaV1<Values>) {
  const validate = overrideValidationMessages(
    schema,
    {} as Partial<Record<keyof Values, string>>,
  );
  return (values: TherapistWorkingHoursFormValues) =>
    validate(
      normalizeTherapistWorkingHoursFormValues(values) as unknown as Values,
    );
}
