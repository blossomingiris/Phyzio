import { createContext, useContext } from "react";
import type { ConfirmationParams } from "./types";

export type ConfirmationContextValue = {
  confirm: (params: ConfirmationParams) => Promise<boolean>;
};

export const ConfirmationContext =
  createContext<ConfirmationContextValue | null>(null);

export function useConfirmation() {
  const context = useContext(ConfirmationContext);
  if (!context) {
    throw new Error(
      "useConfirmation must be used within a ConfirmationProvider",
    );
  }
  return context.confirm;
}
