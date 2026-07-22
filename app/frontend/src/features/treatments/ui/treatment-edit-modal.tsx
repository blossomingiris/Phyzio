import { patchTreatmentsById } from "@/shared/api/generated/validation-schemas";
import type { TreatmentDetail } from "@/shared/domain/treatment";
import { applyApiFieldErrors } from "@/shared/lib/mantine/apply-api-field-errors";
import { FormModal } from "@/shared/ui/form-modal";
import { useForm } from "@mantine/form";
import {
  treatmentToFormValues,
  normalizeTreatmentUpdateValues,
  validateTreatmentForm,
} from "../model/treatment-form-values";
import { useUpdateTreatment } from "../model/use-update-treatment";
import { TreatmentFormFields } from "./treatment-form-fields";

export function TreatmentEditModal({
  treatment,
  opened,
  onClose,
}: {
  treatment: TreatmentDetail;
  opened: boolean;
  onClose: () => void;
}) {
  const updateTreatment = useUpdateTreatment();

  const form = useForm({
    initialValues: treatmentToFormValues(treatment),
    validate: validateTreatmentForm(
      patchTreatmentsById,
      normalizeTreatmentUpdateValues,
    ),
  });

  const handleSubmit = form.onSubmit(async (values) => {
    if (!form.isDirty()) {
      onClose();
      return;
    }

    try {
      await updateTreatment.mutateAsync({
        params: { path: { id: treatment.id } },
        body: normalizeTreatmentUpdateValues(values),
      });
      onClose();
    } catch (error) {
      applyApiFieldErrors(form, error);
    }
  });

  return (
    <FormModal
      opened={opened}
      onClose={onClose}
      title="Edit Treatment"
      submitLabel="Save Changes"
      onSubmit={handleSubmit}
      isPending={updateTreatment.isPending}
      error={updateTreatment.error}
    >
      <TreatmentFormFields form={form} showActiveToggle />
    </FormModal>
  );
}
