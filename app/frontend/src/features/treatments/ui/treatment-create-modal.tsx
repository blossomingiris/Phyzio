import { getApiErrorMessage, isGeneralError } from "@/shared/api/errors";
import { postTreatments } from "@/shared/api/generated/validation-schemas";
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
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Text fw={700} size="xl">
          New Treatment
        </Text>
      }
      size="xl"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="xl">
          {isGeneralError(createTreatment.error) && (
            <Alert color="error" variant="light" icon={<IconAlertCircle />}>
              {getApiErrorMessage(createTreatment.error)}
            </Alert>
          )}

          <TreatmentFormFields form={form} />

          <Divider />

          <Group justify="flex-end">
            <Button variant="default" type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" loading={createTreatment.isPending}>
              Create Treatment
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
