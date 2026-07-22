import { postClients } from "@/shared/api/generated/validation-schemas";
import { applyApiFieldErrors } from "@/shared/lib/mantine/apply-api-field-errors";
import { FormModal } from "@/shared/ui/form-modal";
import { useForm } from "@mantine/form";
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
    <FormModal
      opened={opened}
      onClose={handleClose}
      title="New Client"
      submitLabel="Create Client"
      onSubmit={handleSubmit}
      isPending={createClient.isPending}
      error={createClient.error}
    >
      <ClientFormFields form={form} />
    </FormModal>
  );
}
