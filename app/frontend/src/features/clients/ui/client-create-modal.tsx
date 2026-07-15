import { getApiErrorMessage, isGeneralError } from "@/shared/api/errors";
import { postClients } from "@/shared/api/generated/validation-schemas";
import { applyApiFieldErrors } from "@/shared/lib/mantine/apply-api-field-errors";
import { Alert, Button, Group, Modal, Stack, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconAlertCircle } from "@tabler/icons-react";
import {
  EMPTY_CLIENT_FORM_VALUES,
  normalizeClientFormValues,
  validateClientForm,
} from "../model/client-form-values";
import { useCreateClient } from "../model/use-create-client";
import { ClientFormFields } from "./client-form-fields";

export function ClientCreateModal({
  opened,
  onClose,
}: {
  opened: boolean;
  onClose: () => void;
}) {
  const createClient = useCreateClient();

  const form = useForm({
    initialValues: EMPTY_CLIENT_FORM_VALUES,
    validate: validateClientForm(postClients),
  });

  const handleClose = () => {
    form.reset();
    createClient.reset();
    onClose();
  };

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      await createClient.mutateAsync({
        body: normalizeClientFormValues(values),
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
        <Text fw={700} size="lg">
          New Client
        </Text>
      }
      size="xl"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="lg">
          {isGeneralError(createClient.error) && (
            <Alert color="error" variant="light" icon={<IconAlertCircle />}>
              {getApiErrorMessage(createClient.error)}
            </Alert>
          )}

          <ClientFormFields form={form} />

          <Group justify="flex-end">
            <Button variant="default" type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" loading={createClient.isPending}>
              Create Client
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
