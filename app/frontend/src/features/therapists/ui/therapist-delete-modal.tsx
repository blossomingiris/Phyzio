import type { Therapist } from "@/shared/domain/therapist";
import { TherapistReassignmentDeleteModal } from "@/services/therapist-reassignment";
import { useDeleteTherapist } from "../model/use-delete-therapist";

export function TherapistDeleteModal({
  therapist,
  opened,
  onClose,
}: {
  therapist: Therapist;
  opened: boolean;
  onClose: () => void;
}) {
  const deleteTherapist = useDeleteTherapist();
  const therapistName = `${therapist.firstName} ${therapist.lastName}`;

  return (
    <TherapistReassignmentDeleteModal
      therapistId={therapist.id}
      therapistName={therapistName}
      title="Delete Therapist"
      confirmLabel="Delete Therapist"
      noClientsDescription={
        <>
          Are you sure you want to delete <b>{therapistName}</b>? This action
          cannot be undone.
        </>
      }
      opened={opened}
      onClose={onClose}
      onDelete={() =>
        deleteTherapist.mutateAsync({ params: { path: { id: therapist.id } } })
      }
      isDeleting={deleteTherapist.isPending}
    />
  );
}
