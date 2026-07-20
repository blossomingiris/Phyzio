import { getApiErrorMessage, isGeneralError } from "@/shared/api/errors";
import {
  patchTherapistsById,
  patchUsersById,
} from "@/shared/api/generated/validation-schemas";
import type { Therapist } from "@/shared/domain/therapist";
import { applyApiFieldErrors } from "@/shared/lib/mantine/apply-api-field-errors";
import {
  Alert,
  Button,
  Divider,
  Group,
  Modal,
  Stack,
  Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
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

const THERAPIST_FIELD_NAMES = [
  "speciality",
  "phone",
  "workingHours",
  "isActive",
] as const;

function TherapistEditForm({
  therapist,
  onClose,
}: {
  therapist: Therapist;
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
      }

      onClose();
    } catch (error) {
      applyApiFieldErrors(form, error);
    }
  });

  const isPending = updateTherapist.isPending || updateTherapistName.isPending;
  const error = updateTherapist.error ?? updateTherapistName.error;

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="lg">
        {isGeneralError(error) && (
          <Alert color="error" variant="light" icon={<IconAlertCircle />}>
            {getApiErrorMessage(error)}
          </Alert>
        )}

        <TherapistEditFormFields form={form} />

        <Divider />

        <Group justify="flex-end">
          <Button variant="default" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isPending}>
            Save Changes
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

export function TherapistEditModal({
  therapist,
  opened,
  onClose,
}: {
  therapist: Therapist;
  opened: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={700} size="xl">
          Edit Therapist
        </Text>
      }
      size="xl"
    >
      <TherapistEditForm therapist={therapist} onClose={onClose} />
    </Modal>
  );
}
