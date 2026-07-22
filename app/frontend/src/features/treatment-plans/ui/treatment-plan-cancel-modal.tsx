import { patchTreatmentPlansByIdStatus } from "@/shared/api/generated/validation-schemas";
import { rqClient } from "@/shared/api/http-client";
import { TREATMENT_PLAN_MANUAL_CANCELLATION_REASON_OPTIONS } from "@/shared/domain/treatment-plan";
import { applyApiFieldErrors } from "@/shared/lib/mantine/apply-api-field-errors";
import { FormModal } from "@/shared/ui/form-modal";
import { Select, Stack, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconBan, IconNotes } from "@tabler/icons-react";
import {
  EMPTY_TREATMENT_PLAN_CANCEL_FORM_VALUES,
  normalizeTreatmentPlanCancelFormValues,
  validateTreatmentPlanCancelForm,
} from "../model/treatment-plan-cancel-form-values";
import { useCancelTreatmentPlan } from "../model/use-cancel-treatment-plan";

export function TreatmentPlanCancelModal({
  planId,
  opened,
  onClose,
}: {
  planId: number;
  opened: boolean;
  onClose: () => void;
}) {
  const cancelTreatmentPlan = useCancelTreatmentPlan();
  const setEndDate = rqClient.useMutation("patch", "/treatment-plans/{id}");

  const form = useForm({
    initialValues: EMPTY_TREATMENT_PLAN_CANCEL_FORM_VALUES,
    validate: validateTreatmentPlanCancelForm(patchTreatmentPlansByIdStatus),
  });

  const handleClose = () => {
    form.reset();
    cancelTreatmentPlan.reset();
    onClose();
  };

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      try {
        await setEndDate.mutateAsync({
          params: { path: { id: planId } },
          body: { endDate: new Date().toISOString() },
        });
      } catch {
        // Best-effort — stamping the end date shouldn't block the cancellation
        // itself, which is the action the admin actually asked for.
      }
      await cancelTreatmentPlan.mutateAsync({
        params: { path: { id: planId } },
        body: normalizeTreatmentPlanCancelFormValues(values),
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
      title="Cancel Treatment Plan"
      submitLabel="Cancel Plan"
      onSubmit={handleSubmit}
      isPending={cancelTreatmentPlan.isPending}
      error={cancelTreatmentPlan.error}
    >
      <Stack gap="lg">
        <Select
          label="Cancellation Reason"
          placeholder="Select a reason"
          leftSection={<IconBan size={16} />}
          data={TREATMENT_PLAN_MANUAL_CANCELLATION_REASON_OPTIONS}
          withAsterisk
          {...form.getInputProps("cancellationReason")}
        />
        {form.values.cancellationReason === "other" && (
          <Textarea
            label="Cancellation Note"
            placeholder="Explain the reason for cancelling"
            leftSectionProps={{
              style: { alignItems: "flex-start", paddingTop: 11 },
            }}
            leftSection={<IconNotes size={16} />}
            withAsterisk
            autosize
            minRows={2}
            {...form.getInputProps("cancellationNote")}
          />
        )}
      </Stack>
    </FormModal>
  );
}
