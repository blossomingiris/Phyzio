import { getApiErrorMessage, isGeneralError } from "@/shared/api/errors";
import { patchClientsById } from "@/shared/api/generated/validation-schemas";
import type { ClientDetail } from "@/shared/domain/client";
import { applyApiFieldErrors } from "@/shared/lib/mantine/apply-api-field-errors";
import { Alert, Button, Group, Modal, Stack, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconAlertCircle } from "@tabler/icons-react";
import {
  clientToFormValues,
  normalizeClientFormValues,
  validateClientForm,
} from "../model/client-form-values";
import { useUpdateClient } from "../model/use-update-client";
import { ClientFormFields } from "./client-form-fields";

/**
 * Kept separate from `ClientEditModal` so it only exists inside `Modal`'s
 * children — Mantine unmounts those on close, which gives this component
 * (and its `useForm`) a fresh instance seeded from the latest `client` every
 * time the modal reopens, no manual resync needed.
 */
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
        <Text fw={700} size="lg">
          Edit Client
        </Text>
      }
      size="xl"
    >
      <ClientEditForm client={client} onClose={onClose} />
    </Modal>
  );
}
