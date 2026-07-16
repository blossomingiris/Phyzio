import { getApiErrorMessage, isGeneralError } from "@/shared/api/errors";
import { patchClientsById } from "@/shared/api/generated/validation-schemas";
import type { ClientDetail } from "@/shared/domain/client";
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
  clientToFormValues,
  normalizeClientFormValues,
  validateClientForm,
} from "../model/client-form-values";
import { useUpdateClient } from "../model/use-update-client";
import { ClientFormFields } from "./client-form-fields";

function ClientEditForm({
  client,
  onClose,
}: {
  client: ClientDetail;
  onClose: () => void;
}) {
  const updateClient = useUpdateClient();

  const form = useForm({
    initialValues: clientToFormValues(client),
    validate: validateClientForm(patchClientsById),
  });

  const handleSubmit = form.onSubmit(async (values) => {
    if (!form.isDirty()) {
      onClose();
      return;
    }

    try {
      await updateClient.mutateAsync({
        params: { path: { id: client.id } },
        body: normalizeClientFormValues(values),
      });
      onClose();
    } catch (error) {
      applyApiFieldErrors(form, error);
    }
  });

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="lg">
        {isGeneralError(updateClient.error) && (
          <Alert color="error" variant="light" icon={<IconAlertCircle />}>
            {getApiErrorMessage(updateClient.error)}
          </Alert>
        )}

        <ClientFormFields form={form} />

        <Divider />

        <Group justify="flex-end">
          <Button variant="default" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={updateClient.isPending}>
            Save Changes
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

export function ClientEditModal({
  client,
  opened,
  onClose,
}: {
  client: ClientDetail;
  opened: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={700} size="xl">
          Edit Client
        </Text>
      }
      size="xl"
    >
      <ClientEditForm client={client} onClose={onClose} />
    </Modal>
  );
}
