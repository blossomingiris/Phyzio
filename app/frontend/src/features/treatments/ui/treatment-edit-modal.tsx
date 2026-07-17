import { getApiErrorMessage, isGeneralError } from "@/shared/api/errors";
import { patchTreatmentsById } from "@/shared/api/generated/validation-schemas";
import type { TreatmentDetail } from "@/shared/domain/treatment";
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
  treatmentToFormValues,
  normalizeTreatmentUpdateValues,
  validateTreatmentForm,
} from "../model/treatment-form-values";
import { useUpdateTreatment } from "../model/use-update-treatment";
import { TreatmentFormFields } from "./treatment-form-fields";

function TreatmentEditForm({
  treatment,
  onClose,
}: {
  treatment: TreatmentDetail;
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
    <form onSubmit={handleSubmit}>
      <Stack gap="xl">
        {isGeneralError(updateTreatment.error) && (
          <Alert color="error" variant="light" icon={<IconAlertCircle />}>
            {getApiErrorMessage(updateTreatment.error)}
          </Alert>
        )}

        <TreatmentFormFields form={form} showActiveToggle />

        <Divider />

        <Group justify="flex-end">
          <Button variant="default" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={updateTreatment.isPending}>
            Save Changes
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

export function TreatmentEditModal({
  treatment,
  opened,
  onClose,
}: {
  treatment: TreatmentDetail;
  opened: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={700} size="xl">
          Edit Treatment
        </Text>
      }
      size="xl"
    >
      <TreatmentEditForm treatment={treatment} onClose={onClose} />
    </Modal>
  );
}
