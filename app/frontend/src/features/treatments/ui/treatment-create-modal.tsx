import { postTreatments } from "@/shared/api/generated/validation-schemas";
import { applyApiFieldErrors } from "@/shared/lib/mantine/apply-api-field-errors";
import { FormModal } from "@/shared/ui/form-modal";
import { useForm } from "@mantine/form";
import {
  EMPTY_TREATMENT_FORM_VALUES,
  normalizeTreatmentFormValues,
  validateTreatmentForm,
} from "../model/treatment-form-values";
import { useCreateTreatment } from "../model/use-create-treatment";
import { TreatmentFormFields } from "./treatment-form-fields";

export function TreatmentCreateModal({
  opened,
  onClose,
}: {
  opened: boolean;
  onClose: () => void;
}) {
  const createTreatment = useCreateTreatment();

  const form = useForm({
    initialValues: EMPTY_TREATMENT_FORM_VALUES,
    validate: validateTreatmentForm(postTreatments),
  });

  const handleClose = () => {
    form.reset();
    createTreatment.reset();
    onClose();
  };

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      await createTreatment.mutateAsync({
        body: normalizeTreatmentFormValues(values),
      });
      handleClose();
    } catch (error) {
      applyApiFieldErrors(form, error);
    }
  });

  return (
    <FormModal
      opened={opened}
      onClose={handleClose}
      title="New Treatment"
      submitLabel="Create Treatment"
      onSubmit={handleSubmit}
      isPending={createTreatment.isPending}
      error={createTreatment.error}
    >
      <TreatmentFormFields form={form} />
    </FormModal>
  );
}
