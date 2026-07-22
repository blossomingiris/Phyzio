import { WorkingHoursInput } from "@/services/working-hours";
import { patchTherapistsById } from "@/shared/api/generated/validation-schemas";
import type { Therapist } from "@/shared/domain/therapist";
import { applyApiFieldErrors } from "@/shared/lib/mantine/apply-api-field-errors";
import { FormModal } from "@/shared/ui/form-modal";
import { useForm } from "@mantine/form";
import {
  normalizeTherapistWorkingHoursFormValues,
  therapistToWorkingHoursFormValues,
  validateTherapistWorkingHoursForm,
} from "../model/therapist-working-hours-form-values";
import { useUpdateTherapist } from "../model/use-update-therapist";

export function TherapistWorkingHoursModal({
  therapist,
  opened,
  onClose,
}: {
  therapist: Therapist;
  opened: boolean;
  onClose: () => void;
}) {
  const updateTherapist = useUpdateTherapist();

  const form = useForm({
    initialValues: therapistToWorkingHoursFormValues(therapist),
    validate: validateTherapistWorkingHoursForm(patchTherapistsById),
  });

  const handleClose = () => {
    form.reset();
    updateTherapist.reset();
    onClose();
  };

  const handleSubmit = form.onSubmit(async (values) => {
    if (!form.isDirty()) {
      handleClose();
      return;
    }

    try {
      await updateTherapist.mutateAsync({
        params: { path: { id: therapist.id } },
        body: normalizeTherapistWorkingHoursFormValues(values),
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
      title="Edit Working Hours"
      submitLabel="Save Changes"
      onSubmit={handleSubmit}
      isPending={updateTherapist.isPending}
      error={updateTherapist.error}
    >
      <WorkingHoursInput form={form} />
    </FormModal>
  );
}
