import type { AdminUser } from "@/shared/domain/user";
import { useConfirmation } from "@/shared/lib/confirmation/use-confirmation";
import { CardActionsMenu } from "@/shared/ui/card-actions-menu";
import { TherapistReassignmentDeleteModal } from "@/services/therapist-reassignment";
import { Card, Group, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import { useDeleteUser } from "../model/use-delete-user";
import { UserEditModal } from "./user-edit-modal";
import { UserOverviewDetails } from "./user-overview-details";

export function UserOverview({ user }: { user: AdminUser }) {
  const [editOpened, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] =
    useDisclosure(false);
  const isDeleted = !!user.deletedAt;
  const isTherapist = user.role === "therapist";
  const userName = `${user.firstName} ${user.lastName}`;

  const confirm = useConfirmation();
  const deleteUser = useDeleteUser();

  const handleSimpleDelete = async () => {
    const confirmed = await confirm({
      title: "Delete User",
      description: (
        <>
          Are you sure you want to delete{" "}
          <Text span fw={600}>
            {userName}
          </Text>
          ? This action cannot be undone.
        </>
      ),
      confirmLabel: "Delete User",
      confirmVariant: "destructive",
    });
    if (!confirmed) return;

    deleteUser.mutate({ params: { path: { id: user.id } } });
  };

  const handleDeleteClick = () => {
    if (isTherapist) {
      openDelete();
    } else {
      handleSimpleDelete();
    }
  };

  return (
    <>
      <Card withBorder shadow="md" padding="xl" maw={580}>
        <Card.Section
          withBorder
          inheritPadding
          py="sm"
          mb="lg"
          pr="sm"
          bg="var(--surface-subtle)"
        >
          <Group justify="space-between">
            <Text fw={600} tt="uppercase">
              User Details
            </Text>
            {!isDeleted && (
              <CardActionsMenu
                label="User actions"
                actions={[
                  { label: "Edit", icon: IconPencil, onClick: openEdit },
                  {
                    label: "Delete",
                    icon: IconTrash,
                    onClick: handleDeleteClick,
                    color: "error",
                  },
                ]}
              />
            )}
          </Group>
        </Card.Section>

        <UserOverviewDetails user={user} />
      </Card>

      <UserEditModal user={user} opened={editOpened} onClose={closeEdit} />

      {isTherapist && (
        <TherapistReassignmentDeleteModal
          therapistId={user.id}
          therapistName={userName}
          title="Delete User"
          confirmLabel="Delete User"
          noClientsDescription={
            <>
              Are you sure you want to delete <b>{userName}</b>? Their linked
              therapist profile will be deleted as well. This action cannot be
              undone.
            </>
          }
          opened={deleteOpened}
          onClose={closeDelete}
          onDelete={() =>
            deleteUser.mutateAsync({ params: { path: { id: user.id } } })
          }
          isDeleting={deleteUser.isPending}
        />
      )}
    </>
  );
}
