import type { ConfirmationParams } from "./types";

export const DEFAULT_CONFIRMATION_PARAMS: Required<ConfirmationParams> = {
  title: "Confirm your action",
  description: "Are you sure you want to continue?",
  confirmLabel: "Confirm",
  cancelLabel: "Cancel",
  confirmVariant: "default",
};
