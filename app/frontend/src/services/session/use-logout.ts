import { useConfirmation } from "@/shared/lib/confirmation/use-confirmation";
import { useSessionStore } from "./session-store";

export function useLogout() {
  const logout = useSessionStore((state) => state.logout);
  const confirm = useConfirmation();

  return async () => {
    const confirmed = await confirm({
      title: "Log Out",
      description: "Are you sure you want to log out?",
      confirmLabel: "Log Out",
    });
    if (!confirmed) return;

    await logout();
  };
}
