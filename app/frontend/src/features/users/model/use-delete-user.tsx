import { getApiErrorMessage } from "@/shared/api/errors";
import { rqClient } from "@/shared/api/http-client";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle, IconCheck } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return rqClient.useMutation("delete", "/users/{id}", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/users/"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/users/{id}"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/therapists/"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/therapists/{id}"] });
      notifications.show({
        color: "success",
        icon: <IconCheck size={18} />,
        message: "User was deleted.",
      });
    },
    onError: (error) => {
      notifications.show({
        color: "error",
        icon: <IconAlertCircle size={18} />,
        message: getApiErrorMessage(error),
      });
    },
  });
}
