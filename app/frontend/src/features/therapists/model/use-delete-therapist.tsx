import { getApiErrorMessage } from "@/shared/api/errors";
import { rqClient } from "@/shared/api/http-client";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle, IconCheck } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";

export function useDeleteTherapist() {
  const queryClient = useQueryClient();

  return rqClient.useMutation("delete", "/therapists/{id}", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/therapists/"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/therapists/{id}"] });
      notifications.show({
        color: "success",
        icon: <IconCheck size={18} />,
        message: "Therapist was deleted.",
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
