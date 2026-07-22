import type { TreatmentPlanDetail } from "@/shared/domain/treatment-plan";
import { overrideValidationMessages } from "@/shared/lib/mantine/override-validation-messages";
import type { StandardSchemaV1 } from "@standard-schema/spec";

export type TreatmentPlanEditFormValues = {
  therapistId: string;
  startDate: string | null;
  endDate: string | null;
};

export function treatmentPlanToEditFormValues(
  plan: TreatmentPlanDetail,
): TreatmentPlanEditFormValues {
  return {
    therapistId: String(plan.therapist.id),
    startDate: plan.startDate.slice(0, 10),
    endDate: plan.endDate ? plan.endDate.slice(0, 10) : null,
  };
}

function toIsoDateTime(dateOnly: string): string {
  return new Date(`${dateOnly}T00:00:00.000Z`).toISOString();
}

export function normalizeTreatmentPlanEditFormValues(
  values: TreatmentPlanEditFormValues,
) {
  return {
    therapistId: Number(values.therapistId),
    startDate: values.startDate ? toIsoDateTime(values.startDate) : undefined,
    endDate: values.endDate ? toIsoDateTime(values.endDate) : null,
  };
}

const TREATMENT_PLAN_EDIT_FIELD_MESSAGES = {
  therapistId: "Select a therapist",
  startDate: "Select a start date",
};

export function validateTreatmentPlanEditForm<
  Values extends Record<string, unknown>,
>(schema: StandardSchemaV1<Values>) {
  const validate = overrideValidationMessages(
    schema,
    TREATMENT_PLAN_EDIT_FIELD_MESSAGES as Partial<Record<keyof Values, string>>,
  );
  return async (values: TreatmentPlanEditFormValues) => {
    const errors = await validate(
      normalizeTreatmentPlanEditFormValues(values) as unknown as Values,
    );
    if (
      values.startDate &&
      values.endDate &&
      values.endDate < values.startDate
    ) {
      errors["endDate"] = "End date must be on or after start date";
    }
    return errors;
  };
}
