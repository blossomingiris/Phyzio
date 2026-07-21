import { Group, Stack, Switch, Text, type SwitchProps } from "@mantine/core";
import type { ReactNode } from "react";

type SwitchFieldProps = Omit<
  SwitchProps,
  "label" | "description" | "checked" | "onChange"
> & {
  label: string;
  description?: ReactNode;
  checked?: boolean;
  onChange: (checked: boolean) => void;
};

export function SwitchField({
  label,
  description,
  checked = false,
  onChange,
  ...switchProps
}: SwitchFieldProps) {
  return (
    <Group
      gap="xs"
      align={description ? "flex-start" : "center"}
      wrap="nowrap"
      style={{ cursor: "pointer", minHeight: 44 }}
      onClick={() => onChange(!checked)}
    >
      <Switch
        aria-label={label}
        checked={checked}
        onChange={(event) => onChange(event.currentTarget.checked)}
        {...switchProps}
      />
      {description ? (
        <Stack gap={2}>
          <Text size="sm" fw={500}>
            {label}
          </Text>
          <Text size="xs" c="dimmed">
            {description}
          </Text>
        </Stack>
      ) : (
        <Text size="sm">{label}</Text>
      )}
    </Group>
  );
}
