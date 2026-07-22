import { postUsers } from "@/shared/api/generated/validation-schemas";
import { applyApiFieldErrors } from "@/shared/lib/mantine/apply-api-field-errors";
import { FormModal } from "@/shared/ui/form-modal";
import { useForm } from "@mantine/form";
import {
  EMPTY_USER_FORM_VALUES,
  normalizeCreateUserFormValues,
  validateCreateUserForm,
} from "../model/user-form-values";
import { useCreateUser } from "../model/use-create-user";
import { UserCreateFormFields } from "./user-create-form-fields";

export function UserCreateModal({
  opened,
  onClose,
}: {
  opened: boolean;
  onClose: () => void;
}) {
  const createUser = useCreateUser();

  const form = useForm({
    initialValues: EMPTY_USER_FORM_VALUES,
    validate: validateCreateUserForm(postUsers),
  });

  const handleClose = () => {
    form.reset();
    createUser.reset();
    onClose();
  };

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      await createUser.mutateAsync({
        body: normalizeCreateUserFormValues(values),
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
      title="New Admin"
      submitLabel="Create Admin"
      onSubmit={handleSubmit}
      isPending={createUser.isPending}
      error={createUser.error}
    >
      <UserCreateFormFields form={form} />
    </FormModal>
  );
}
