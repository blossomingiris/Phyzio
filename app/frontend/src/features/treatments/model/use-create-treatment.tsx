import { rqClient } from "@/shared/api/http-client";
import { notifications } from "@mantine/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { IconCheck } from "@tabler/icons-react";

export function useCreateTreatment() {
  const queryClient = useQueryClient();

  return rqClient.useMutation("post", "/treatments/", {
    onSuccess: (treatment) => {
      queryClient.invalidateQueries({ queryKey: ["get", "/treatments/"] });
      notifications.show({
        color: "success",
        icon: <IconCheck size={18} />,
        message: `${treatment.name} was created.`,
      });
    },
  });
}
