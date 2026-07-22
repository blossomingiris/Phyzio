import { rqClient } from "@/shared/api/http-client";
import { notifications } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";

export function useUpdatePassword() {
  return rqClient.useMutation("patch", "/me/password", {
    onSuccess: () => {
      notifications.show({
        color: "success",
        icon: <IconCheck size={18} />,
        message: "Password was changed.",
      });
    },
  });
}
