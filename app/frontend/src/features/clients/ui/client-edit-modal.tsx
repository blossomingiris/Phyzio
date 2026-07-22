import { patchClientsById } from "@/shared/api/generated/validation-schemas";
import type { ClientDetail } from "@/shared/domain/client";
import { applyApiFieldErrors } from "@/shared/lib/mantine/apply-api-field-errors";
import { FormModal } from "@/shared/ui/form-modal";
import { useForm } from "@mantine/form";
import {
  clientToFormValues,
  normalizeUpdateClientFormValues,
  validateUpdateClientForm,
} from "../model/client-form-values";
import { useUpdateClient } from "../model/use-update-client";
import { ClientFormFields } from "./client-form-fields";

export function ClientEditModal({
  client,
  opened,
  onClose,
}: {
  client: ClientDetail;
  opened: boolean;
  onClose: () => void;
}) {
  const updateClient = useUpdateClient();

  const form = useForm({
    initialValues: clientToFormValues(client),
    validate: validateUpdateClientForm(patchClientsById),
  });

  const handleSubmit = form.onSubmit(async (values) => {
    if (!form.isDirty()) {
      onClose();
      return;
    }

    try {
      await updateClient.mutateAsync({
        params: { path: { id: client.id } },
        body: normalizeUpdateClientFormValues(values),
      });
      onClose();
    } catch (error) {
      applyApiFieldErrors(form, error);
    }
  });

  return (
    <FormModal
      opened={opened}
      onClose={onClose}
      title="Edit Client"
      submitLabel="Save Changes"
      onSubmit={handleSubmit}
      isPending={updateClient.isPending}
      error={updateClient.error}
    >
      <ClientFormFields form={form} showTherapist={false} />
    </FormModal>
  );
}
