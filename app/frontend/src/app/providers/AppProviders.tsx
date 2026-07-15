import { ConfirmationProvider } from "@/shared/lib/confirmation/confirmation-provider";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { cssVariablesResolver, theme } from "../theme";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <MantineProvider
      theme={theme}
      defaultColorScheme="light"
      cssVariablesResolver={cssVariablesResolver}
    >
      <Notifications position="top-center" autoClose={5000} />
      <QueryClientProvider client={queryClient}>
        <ConfirmationProvider>{children}</ConfirmationProvider>
      </QueryClientProvider>
    </MantineProvider>
  );
}
