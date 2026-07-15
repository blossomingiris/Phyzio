import { useSessionStore } from "@/services/session";
import { ROUTES } from "@/shared/model/routes";
import { useMutation } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router";

export function useLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  const login = useSessionStore((state) => state.login);

  return useMutation({
    mutationFn: login,
    onSuccess: () => {
      navigate(from ?? ROUTES.HOME, { replace: true });
    },
  });
}
