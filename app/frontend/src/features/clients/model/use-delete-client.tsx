import { getApiErrorMessage } from "@/shared/api/errors";
import { rqClient } from "@/shared/api/http-client";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle, IconCheck } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";

export function useDeleteClient() {
  const queryClient = useQueryClient();

  return rqClient.useMutation("delete", "/clients/{id}", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/clients/"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/clients/{id}"] });
      notifications.show({
        color: "success",
        icon: <IconCheck size={18} />,
        message: "Client was deleted.",
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
