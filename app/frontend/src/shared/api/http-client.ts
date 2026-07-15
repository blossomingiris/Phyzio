import { forceLogout } from "@/shared/lib/auth/force-logout";
import { refreshAccessToken } from "@/shared/lib/auth/refresh-access-token";
import { getToken } from "@/shared/lib/auth/token-storage";
import { CONFIG } from "@/shared/model/config";
import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";
import type { ApiPaths } from "./generated";

export const fetchClient = createFetchClient<ApiPaths>({
  baseUrl: CONFIG.API_BASE_URL,
  credentials: "include",
});

const pendingRetries = new Map<string, Request>();

fetchClient.use({
  onRequest({ request, id }) {
    const token = getToken();
    if (token) request.headers.set("Authorization", `Bearer ${token}`);
    pendingRetries.set(id, request.clone());
  },
  async onResponse({ request, response, id }) {
    const retryRequest = pendingRetries.get(id);
    pendingRetries.delete(id);

    const isAuthEndpoint = new URL(request.url).pathname.startsWith("/auth/");
    if (response.status !== 401 || isAuthEndpoint) return;

    const newToken = await refreshAccessToken();
    if (!newToken || !retryRequest) {
      forceLogout();
      return;
    }
    retryRequest.headers.set("Authorization", `Bearer ${newToken}`);
    return globalThis.fetch(retryRequest);
  },
  onError({ id }) {
    pendingRetries.delete(id);
  },
});

export const rqClient = createClient(fetchClient);
