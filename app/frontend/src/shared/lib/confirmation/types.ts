import type { ReactNode } from "react";

export type ConfirmationVariant = "default" | "destructive";

export type ConfirmationParams = {
  title?: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: ConfirmationVariant;
};

export type ConfirmationDialogParams = ConfirmationParams & {
  onConfirm: () => void;
  onCancel: () => void;
};
