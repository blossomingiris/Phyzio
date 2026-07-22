import {
  patchTherapistsById,
  patchUsersById,
} from "@/shared/api/generated/validation-schemas";
import type { Therapist } from "@/shared/domain/therapist";
import { applyApiFieldErrors } from "@/shared/lib/mantine/apply-api-field-errors";
import { FormModal } from "@/shared/ui/form-modal";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle } from "@tabler/icons-react";
import {
  normalizeTherapistNameFormValues,
  normalizeUpdateTherapistFormValues,
  therapistToFormValues,
  validateUpdateTherapistForm,
} from "../model/therapist-form-values";
import { useUpdateTherapist } from "../model/use-update-therapist";
import { useUpdateTherapistName } from "../model/use-update-therapist-name";
import { TherapistEditFormFields } from "./therapist-edit-form-fields";

const THERAPIST_FIELD_NAMES = ["speciality", "phone", "isActive"] as const;

export function TherapistEditModal({
  therapist,
  opened,
  onClose,
}: {
  therapist: Therapist;
  opened: boolean;
  onClose: () => void;
}) {
  const updateTherapist = useUpdateTherapist();
  const updateTherapistName = useUpdateTherapistName();

  const form = useForm({
    initialValues: therapistToFormValues(therapist),
    validate: validateUpdateTherapistForm(patchTherapistsById, patchUsersById),
  });

  const handleSubmit = form.onSubmit(async (values) => {
    if (!form.isDirty()) {
      onClose();
      return;
    }

    try {
      if (form.isDirty("firstName") || form.isDirty("lastName")) {
        await updateTherapistName.mutateAsync({
          params: { path: { id: therapist.id } },
          body: normalizeTherapistNameFormValues(values),
        });
      }

      if (THERAPIST_FIELD_NAMES.some((field) => form.isDirty(field))) {
        await updateTherapist.mutateAsync({
          params: { path: { id: therapist.id } },
          body: normalizeUpdateTherapistFormValues(values),
        });

        if (form.isDirty("isActive") && therapist.isActive && !values.isActive) {
          notifications.show({
            color: "accent",
            icon: <IconAlertCircle size={18} />,
            message: `${values.firstName} ${values.lastName}'s in-progress treatment plans have been paused.`,
          });
        }
      }

      onClose();
    } catch (error) {
      applyApiFieldErrors(form, error);
    }
  });

  return (
    <FormModal
      opened={opened}
      onClose={onClose}
      title="Edit Therapist"
      submitLabel="Save Changes"
      onSubmit={handleSubmit}
      isPending={updateTherapist.isPending || updateTherapistName.isPending}
      error={updateTherapist.error ?? updateTherapistName.error}
    >
      <TherapistEditFormFields form={form} />
    </FormModal>
  );
}
