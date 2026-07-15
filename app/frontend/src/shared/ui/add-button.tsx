import { Button, type ButtonProps } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

export function AddButton({
  label,
  icon = <IconPlus size={14} />,
  ...buttonProps
}: {
  label: string;
  icon?: ReactNode;
} & Omit<ButtonProps, "leftSection" | "children"> &
  Pick<ComponentPropsWithoutRef<"button">, "onClick">) {
  return (
    <Button leftSection={icon} {...buttonProps}>
      {label}
    </Button>
  );
}
