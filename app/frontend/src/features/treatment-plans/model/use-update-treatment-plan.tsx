import { rqClient } from "@/shared/api/http-client";
import { notifications } from "@mantine/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { IconCheck } from "@tabler/icons-react";

export function useUpdateTreatmentPlan() {
  const queryClient = useQueryClient();

  return rqClient.useMutation("patch", "/treatment-plans/{id}", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/treatment-plans/"] });
      queryClient.invalidateQueries({
        queryKey: ["get", "/treatment-plans/{id}"],
      });
      notifications.show({
        color: "success",
        icon: <IconCheck size={18} />,
        message: "Treatment plan was updated.",
      });
    },
  });
}
