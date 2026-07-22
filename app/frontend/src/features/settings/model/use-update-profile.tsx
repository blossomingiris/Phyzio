import { useSessionStore } from "@/services/session";
import { rqClient } from "@/shared/api/http-client";
import { notifications } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";

export function useUpdateProfile() {
  const setUser = useSessionStore((state) => state.setUser);

  return rqClient.useMutation("patch", "/me/", {
    onSuccess: (user) => {
      setUser(user);
      notifications.show({
        color: "success",
        icon: <IconCheck size={18} />,
        message: "Profile was updated.",
      });
    },
  });
}
