import { rqClient } from "@/shared/api/http-client";
import { notifications } from "@mantine/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { IconCheck } from "@tabler/icons-react";

export function useCreateClient() {
  const queryClient = useQueryClient();

  return rqClient.useMutation("post", "/clients/", {
    onSuccess: (client) => {
      queryClient.invalidateQueries({ queryKey: ["get", "/clients/"] });
      notifications.show({
        color: "success",
        icon: <IconCheck size={18} />,
        message: `${client.firstName} ${client.lastName} was created.`,
      });
    },
  });
}
