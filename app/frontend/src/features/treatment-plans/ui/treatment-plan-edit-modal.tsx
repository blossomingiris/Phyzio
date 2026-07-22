import { patchTreatmentPlansById } from "@/shared/api/generated/validation-schemas";
import type { TreatmentPlanDetail } from "@/shared/domain/treatment-plan";
import { applyApiFieldErrors } from "@/shared/lib/mantine/apply-api-field-errors";
import { useActiveTherapistsQuery } from "@/shared/model/use-active-therapists-query";
import { FormModal } from "@/shared/ui/form-modal";
import { SimpleGrid, Select } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { IconCalendarEvent, IconCalendarPlus, IconStethoscope } from "@tabler/icons-react";
import {
  normalizeTreatmentPlanEditFormValues,
  treatmentPlanToEditFormValues,
  validateTreatmentPlanEditForm,
} from "../model/treatment-plan-edit-form-values";
import { useUpdateTreatmentPlan } from "../model/use-update-treatment-plan";

export function TreatmentPlanEditModal({
  plan,
  opened,
  onClose,
}: {
  plan: TreatmentPlanDetail;
  opened: boolean;
  onClose: () => void;
}) {
  const updateTreatmentPlan = useUpdateTreatmentPlan();
  const activeTherapistsQuery = useActiveTherapistsQuery();
  const therapistOptions = (activeTherapistsQuery.data?.data ?? []).map(
    (therapist) => ({
      value: String(therapist.id),
      label: `${therapist.firstName} ${therapist.lastName}`,
      disabled: !therapist.isActive && therapist.id !== plan.therapist.id,
    }),
  );

  const form = useForm({
    initialValues: treatmentPlanToEditFormValues(plan),
    validate: validateTreatmentPlanEditForm(patchTreatmentPlansById),
  });

  const handleSubmit = form.onSubmit(async (values) => {
    if (!form.isDirty()) {
      onClose();
      return;
    }

    try {
      await updateTreatmentPlan.mutateAsync({
        params: { path: { id: plan.id } },
        body: normalizeTreatmentPlanEditFormValues(values),
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
      title="Edit Treatment Plan"
      submitLabel="Save Changes"
      onSubmit={handleSubmit}
      isPending={updateTreatmentPlan.isPending}
      error={updateTreatmentPlan.error}
    >
      <SimpleGrid cols={2} spacing="lg">
        <Select
          label="Therapist"
          placeholder="Select a therapist"
          leftSection={<IconStethoscope size={16} />}
          data={therapistOptions}
          searchable
          allowDeselect={false}
          withAsterisk
          {...form.getInputProps("therapistId")}
        />
      </SimpleGrid>

      <SimpleGrid cols={2} spacing="lg">
        <DateInput
          label="Start Date"
          placeholder="Select a date"
          leftSection={<IconCalendarPlus size={16} />}
          withAsterisk
          {...form.getInputProps("startDate")}
        />
        <DateInput
          label="End Date"
          placeholder="Select a date"
          leftSection={<IconCalendarEvent size={16} />}
          clearable
          {...form.getInputProps("endDate")}
        />
      </SimpleGrid>
    </FormModal>
  );
}
