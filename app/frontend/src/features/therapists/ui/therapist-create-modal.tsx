import { getApiErrorMessage, isGeneralError } from "@/shared/api/errors";
import { postTherapists } from "@/shared/api/generated/validation-schemas";
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
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Text fw={700} size="xl">
          New Therapist
        </Text>
      }
      size="xl"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="lg">
          {isGeneralError(createTherapist.error) && (
            <Alert color="error" variant="light" icon={<IconAlertCircle />}>
              {getApiErrorMessage(createTherapist.error)}
            </Alert>
          )}

          <TherapistCreateFormFields form={form} />

          <Divider />

          <Group justify="flex-end">
            <Button variant="default" type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" loading={createTherapist.isPending}>
              Create Therapist
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
