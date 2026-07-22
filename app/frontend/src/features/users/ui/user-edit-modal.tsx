import { patchUsersById } from "@/shared/api/generated/validation-schemas";
import type { AdminUser } from "@/shared/domain/user";
import { applyApiFieldErrors } from "@/shared/lib/mantine/apply-api-field-errors";
import { FormModal } from "@/shared/ui/form-modal";
import { useForm } from "@mantine/form";
import {
  normalizeUpdateUserFormValues,
  userToFormValues,
  validateUpdateUserForm,
} from "../model/user-form-values";
import { useUpdateUser } from "../model/use-update-user";
import { UserEditFormFields } from "./user-edit-form-fields";

export function UserEditModal({
  user,
  opened,
  onClose,
}: {
  user: AdminUser;
  opened: boolean;
  onClose: () => void;
}) {
  const updateUser = useUpdateUser();

  const form = useForm({
    initialValues: userToFormValues(user),
    validate: validateUpdateUserForm(patchUsersById),
  });

  const handleSubmit = form.onSubmit(async (values) => {
    if (!form.isDirty()) {
      onClose();
      return;
    }

    try {
      await updateUser.mutateAsync({
        params: { path: { id: user.id } },
        body: normalizeUpdateUserFormValues(values),
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
      title="Edit User"
      submitLabel="Save Changes"
      onSubmit={handleSubmit}
      isPending={updateUser.isPending}
      error={updateUser.error}
    >
      <UserEditFormFields form={form} />
    </FormModal>
  );
}
