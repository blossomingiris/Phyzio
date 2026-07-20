import { getApiErrorMessage } from "@/shared/api/errors";
import { rqClient } from "@/shared/api/http-client";
import { ROUTES } from "@/shared/model/routes";
import { notifications } from "@mantine/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { IconAlertCircle, IconCheck } from "@tabler/icons-react";
import { useNavigate } from "react-router";

export function useDeleteTherapist() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return rqClient.useMutation("delete", "/therapists/{id}", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/therapists/"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/therapists/{id}"] });
      notifications.show({
        color: "success",
        icon: <IconCheck size={18} />,
        message: "Therapist was deleted.",
      });
      navigate(ROUTES.THERAPISTS);
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
