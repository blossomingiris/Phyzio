import { rqClient } from "@/shared/api/http-client";
import { notifications } from "@mantine/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { IconCheck } from "@tabler/icons-react";

export function useCreateUser() {
  const queryClient = useQueryClient();

  return rqClient.useMutation("post", "/users/", {
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ["get", "/users/"] });
      notifications.show({
        color: "success",
        icon: <IconCheck size={18} />,
        message: `${user.firstName} ${user.lastName} was created.`,
      });
    },
  });
}
