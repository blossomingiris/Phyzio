import { useState, type ReactNode } from "react";
import { ConfirmationDialog } from "./confirmation-dialog";
import { DEFAULT_CONFIRMATION_PARAMS } from "./constants";
import type { ConfirmationDialogParams, ConfirmationParams } from "./types";
import { ConfirmationContext } from "./use-confirmation";

export function ConfirmationProvider({ children }: { children: ReactNode }) {
  const [dialogParams, setDialogParams] = useState<ConfirmationDialogParams>(
    () => ({
      ...DEFAULT_CONFIRMATION_PARAMS,
      onConfirm: () => {},
      onCancel: () => {},
    }),
  );
  const [opened, setOpened] = useState(false);

  const confirm = (params: ConfirmationParams) => {
    return new Promise<boolean>((resolve) => {
      setDialogParams({
        ...DEFAULT_CONFIRMATION_PARAMS,
        ...params,
        onConfirm: () => {
          setOpened(false);
          resolve(true);
        },
        onCancel: () => {
          setOpened(false);
          resolve(false);
        },
      });
      setOpened(true);
    });
  };

  return (
    <ConfirmationContext.Provider value={{ confirm }}>
      {children}
      <ConfirmationDialog params={dialogParams} opened={opened} />
    </ConfirmationContext.Provider>
  );
}
