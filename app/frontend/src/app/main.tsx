import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import "@mantine/core/styles.css";
import "@fontsource-variable/inter/index.css";
import "@fontsource-variable/geist/index.css";
import "./index.css";
import { AppProviders } from "./providers/AppProviders";
import { router } from "./router";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>,
);
