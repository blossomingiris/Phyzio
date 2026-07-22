import { patchClientsById } from "@/shared/api/generated/validation-schemas";
import type { ClientDetail } from "@/shared/domain/client";
import { applyApiFieldErrors } from "@/shared/lib/mantine/apply-api-field-errors";
import { FormModal } from "@/shared/ui/form-modal";
import { Alert, Select, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconInfoCircle, IconStethoscope } from "@tabler/icons-react";
import {
  clientToTherapistFormValues,
  normalizeClientTherapistFormValues,
  validateClientTherapistForm,
} from "../model/client-therapist-form-values";
import { useTherapistsQuery } from "../model/use-therapists-query";
import { useUpdateClient } from "../model/use-update-client";

export function ClientTherapistModal({
  client,
  opened,
  onClose,
}: {
  client: ClientDetail;
  opened: boolean;
  onClose: () => void;
}) {
  const updateClient = useUpdateClient();
  const { data } = useTherapistsQuery();
  const therapistOptions = (data?.data ?? []).map((therapist) => ({
    value: String(therapist.id),
    label: therapist.isActive
      ? `${therapist.firstName} ${therapist.lastName}`
      : `${therapist.firstName} ${therapist.lastName} (Unavailable)`,
    disabled: !therapist.isActive,
  }));

  const form = useForm({
    initialValues: clientToTherapistFormValues(client),
    validate: validateClientTherapistForm(patchClientsById),
  });

  const handleClose = () => {
    form.reset();
    updateClient.reset();
    onClose();
  };

  const handleSubmit = form.onSubmit(async (values) => {
    if (!form.isDirty()) {
      handleClose();
      return;
    }

    try {
      await updateClient.mutateAsync({
        params: { path: { id: client.id } },
        body: normalizeClientTherapistFormValues(values),
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
      title="Reassign Therapist"
      submitLabel="Save Changes"
      onSubmit={handleSubmit}
      isPending={updateClient.isPending}
      error={updateClient.error}
      size="md"
    >
      <Stack gap="lg">
        <Select
          label="Therapist"
          placeholder="Assign a therapist"
          leftSection={<IconStethoscope size={16} />}
          data={therapistOptions}
          searchable
          clearable
          {...form.getInputProps("therapistId")}
        />

        <Alert color="gray" variant="light" icon={<IconInfoCircle />}>
          Reassigning only changes the client's current therapist. Their
          existing treatment plans and appointments are not affected.
        </Alert>
      </Stack>
    </FormModal>
  );
}
