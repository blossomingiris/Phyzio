import { postTherapists } from "@/shared/api/generated/validation-schemas";
import { applyApiFieldErrors } from "@/shared/lib/mantine/apply-api-field-errors";
import { FormModal } from "@/shared/ui/form-modal";
import { useForm } from "@mantine/form";
import {
  EMPTY_THERAPIST_FORM_VALUES,
  normalizeCreateTherapistFormValues,
  validateCreateTherapistForm,
} from "../model/therapist-form-values";
import { useCreateTherapist } from "../model/use-create-therapist";
import { TherapistCreateFormFields } from "./therapist-create-form-fields";

export function TherapistCreateModal({
  opened,
  onClose,
}: {
  opened: boolean;
  onClose: () => void;
}) {
  const createTherapist = useCreateTherapist();

  const form = useForm({
    initialValues: EMPTY_THERAPIST_FORM_VALUES,
    validate: validateCreateTherapistForm(postTherapists),
  });

  const handleClose = () => {
    form.reset();
    createTherapist.reset();
    onClose();
  };

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      await createTherapist.mutateAsync({
        body: normalizeCreateTherapistFormValues(values),
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
      title="New Therapist"
      submitLabel="Create Therapist"
      onSubmit={handleSubmit}
      isPending={createTherapist.isPending}
      error={createTherapist.error}
    >
      <TherapistCreateFormFields form={form} />
    </FormModal>
  );
}
