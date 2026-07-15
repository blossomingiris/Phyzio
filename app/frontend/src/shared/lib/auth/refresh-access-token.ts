import { CONFIG } from "@/shared/model/config";
import { setToken } from "./token-storage";

let inFlight: Promise<string | null> | null = null;

export function refreshAccessToken(): Promise<string | null> {
  if (!inFlight) {
    inFlight = doRefresh().finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
}

async function doRefresh(): Promise<string | null> {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!response.ok) return null;
    const { token } = (await response.json()) as { token: string };
    setToken(token);
    return token;
  } catch {
    return null;
  }
}
