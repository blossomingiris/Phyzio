import { MantineProvider } from "@mantine/core";
import type { ReactNode } from "react";
import { theme } from "./theme";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="auto">
      {children}
    </MantineProvider>
  );
}
