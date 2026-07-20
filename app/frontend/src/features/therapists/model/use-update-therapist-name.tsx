import { rqClient } from "@/shared/api/http-client";
import { notifications } from "@mantine/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { IconCheck } from "@tabler/icons-react";

export function useUpdateTherapistName() {
  const queryClient = useQueryClient();

  return rqClient.useMutation("patch", "/users/{id}", {
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ["get", "/therapists/"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/therapists/{id}"] });
      notifications.show({
        color: "success",
        icon: <IconCheck size={18} />,
        message: `${user.firstName} ${user.lastName} was updated.`,
      });
    },
  });
}
