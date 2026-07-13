import { Button, type ButtonProps } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import type { ReactNode } from "react";

export function AddButton({
  label,
  icon = <IconPlus size={14} />,
  ...buttonProps
}: {
  label: string;
  icon?: ReactNode;
} & Omit<ButtonProps, "leftSection" | "children">) {
  return (
    <Button leftSection={icon} {...buttonProps}>
      {label}
    </Button>
  );
}
