import type { TreatmentDetail } from "@/shared/domain/treatment";
import { overrideValidationMessages } from "@/shared/lib/mantine/override-validation-messages";
import type { StandardSchemaV1 } from "@standard-schema/spec";

export type TreatmentFormValues = {
  name: string;
  description: string;
  category: TreatmentDetail["category"] | null;
  pricePerUnit: string;
  quantity: number | string;
  durationMinutes: number | string;
  isActive: boolean;
};

export const EMPTY_TREATMENT_FORM_VALUES: TreatmentFormValues = {
  name: "",
  description: "",
  category: null,
  pricePerUnit: "",
  quantity: 1,
  durationMinutes: 30,
  isActive: true,
};

export function treatmentToFormValues(
  treatment: TreatmentDetail,
): TreatmentFormValues {
  return {
    name: treatment.name,
    description: treatment.description ?? "",
    category: treatment.category,
    pricePerUnit: treatment.pricePerUnit,
    quantity: treatment.quantity,
    durationMinutes: treatment.durationMinutes,
    isActive: treatment.isActive,
  };
}

export function normalizeTreatmentFormValues(values: TreatmentFormValues) {
  return {
    name: values.name,
    description: values.description || undefined,
    category: values.category!,
    pricePerUnit: values.pricePerUnit,
    quantity: Number(values.quantity),
    durationMinutes: Number(values.durationMinutes),
  };
}

export function normalizeTreatmentUpdateValues(values: TreatmentFormValues) {
  return {
    ...normalizeTreatmentFormValues(values),
    description: values.description || null,
    isActive: values.isActive,
  };
}

const TREATMENT_FIELD_MESSAGES = {
  name: "Name must be 1–255 characters",
  category: "Select a category",
  pricePerUnit: "Enter a price like 50.00",
  quantity: "Quantity must be at least 1",
  durationMinutes: "Duration must be at least 1 minute",
};

export function validateTreatmentForm<Values extends Record<string, unknown>>(
  schema: StandardSchemaV1<Values>,
  normalize: (
    values: TreatmentFormValues,
  ) => Record<string, unknown> = normalizeTreatmentFormValues,
) {
  const validate = overrideValidationMessages(
    schema,
    TREATMENT_FIELD_MESSAGES as Partial<Record<keyof Values, string>>,
  );
  return (values: TreatmentFormValues) =>
    validate(normalize(values) as unknown as Values);
}
