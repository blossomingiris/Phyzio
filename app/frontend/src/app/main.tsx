import { useSessionStore } from "@/services/session";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "mantine-react-table-open/styles.css";
import "@fontsource-variable/inter/index.css";
import "@fontsource-variable/geist/index.css";
import "./index.css";
import { AppProviders } from "./providers/AppProviders";
import { router } from "./router";

// Restore the session in the background — render is not blocked on it.
useSessionStore.getState().bootstrap();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>,
);
