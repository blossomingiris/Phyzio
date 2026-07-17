import { rqClient } from "@/shared/api/http-client";
import { notifications } from "@mantine/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { IconCheck } from "@tabler/icons-react";

export function useUpdateTreatment() {
  const queryClient = useQueryClient();

  return rqClient.useMutation("patch", "/treatments/{id}", {
    onSuccess: (treatment) => {
      queryClient.invalidateQueries({ queryKey: ["get", "/treatments/"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/treatments/{id}"] });
      notifications.show({
        color: "success",
        icon: <IconCheck size={18} />,
        message: `${treatment.name} was updated.`,
      });
    },
  });
}
