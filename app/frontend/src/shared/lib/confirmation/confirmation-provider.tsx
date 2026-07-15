import { useState, type ReactNode } from "react";
import { ConfirmationDialog } from "./confirmation-dialog";
import { DEFAULT_CONFIRMATION_PARAMS } from "./constants";
import type { ConfirmationDialogParams, ConfirmationParams } from "./types";
import { ConfirmationContext } from "./use-confirmation";

export function ConfirmationProvider({ children }: { children: ReactNode }) {
  const [dialogParams, setDialogParams] = useState<ConfirmationDialogParams>();

  const confirm = (params: ConfirmationParams) => {
    return new Promise<boolean>((resolve) => {
      setDialogParams({
        ...DEFAULT_CONFIRMATION_PARAMS,
        ...params,
        onConfirm: () => {
          setDialogParams(undefined);
          resolve(true);
        },
        onCancel: () => {
          setDialogParams(undefined);
          resolve(false);
        },
      });
    });
  };

  return (
    <ConfirmationContext.Provider value={{ confirm }}>
      {children}
      {dialogParams && <ConfirmationDialog params={dialogParams} />}
    </ConfirmationContext.Provider>
  );
}
