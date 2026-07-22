import type { TreatmentPlanManualCancellationReason } from "@/shared/domain/treatment-plan";
import { overrideValidationMessages } from "@/shared/lib/mantine/override-validation-messages";
import type { StandardSchemaV1 } from "@standard-schema/spec";

export type TreatmentPlanCancelFormValues = {
  cancellationReason: TreatmentPlanManualCancellationReason | null;
  cancellationNote: string;
};

export const EMPTY_TREATMENT_PLAN_CANCEL_FORM_VALUES: TreatmentPlanCancelFormValues =
  {
    cancellationReason: null,
    cancellationNote: "",
  };

export function normalizeTreatmentPlanCancelFormValues(
  values: TreatmentPlanCancelFormValues,
) {
  return {
    status: "cancelled" as const,
    cancellationReason: values.cancellationReason!,
    cancellationNote: values.cancellationNote.trim() || undefined,
  };
}

const TREATMENT_PLAN_CANCEL_FIELD_MESSAGES = {
  cancellationNote: "A note is required when the reason is \"Other\"",
};

export function validateTreatmentPlanCancelForm<
  Values extends Record<string, unknown>,
>(schema: StandardSchemaV1<Values>) {
  const validate = overrideValidationMessages(
    schema,
    TREATMENT_PLAN_CANCEL_FIELD_MESSAGES as Partial<Record<keyof Values, string>>,
  );
  return async (values: TreatmentPlanCancelFormValues) => {
    if (!values.cancellationReason) {
      return { cancellationReason: "Select a reason" };
    }

    const errors = await validate(
      normalizeTreatmentPlanCancelFormValues(values) as unknown as Values,
    );
    if (
      values.cancellationReason === "other" &&
      !values.cancellationNote.trim()
    ) {
      errors["cancellationNote"] =
        'A note is required when the reason is "Other"';
    }
    return errors;
  };
}
