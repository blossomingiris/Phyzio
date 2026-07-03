// App configuration sourced from Vite env vars (typed in env.d.ts).
export const CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000",
} as const;
