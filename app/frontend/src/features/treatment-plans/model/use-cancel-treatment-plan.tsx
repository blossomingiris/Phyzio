import { getApiErrorMessage } from "@/shared/api/errors";
import { rqClient } from "@/shared/api/http-client";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle, IconCheck } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";

export function useCancelTreatmentPlan() {
  const queryClient = useQueryClient();

  return rqClient.useMutation("patch", "/treatment-plans/{id}/status", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/treatment-plans/"] });
      queryClient.invalidateQueries({
        queryKey: ["get", "/treatment-plans/{id}"],
      });
      notifications.show({
        color: "success",
        icon: <IconCheck size={18} />,
        message: "Treatment plan was cancelled.",
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
