import { ROUTES } from "@/shared/model/routes";
import { clearToken } from "./token-storage";

export function forceLogout(): void {
  clearToken();
  window.location.assign(ROUTES.LOGIN);
}
