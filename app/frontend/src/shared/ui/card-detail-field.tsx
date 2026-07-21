import { Group, Text } from "@mantine/core";
import type { Icon } from "@tabler/icons-react";
import type { ReactNode } from "react";

export function CardDetailField({
  icon: FieldIcon,
  label,
  value,
  empty,
}: {
  icon: Icon;
  label: string;
  value: ReactNode;
  empty?: boolean;
}) {
  return (
    <Group gap="xl" justify="space-between">
      <Group gap="xs">
        <FieldIcon size={16} stroke={1.5} color="var(--mantine-color-dimmed)" />
        <Text size="sm" c="dimmed" style={{ whiteSpace: "nowrap" }}>
          {label}
        </Text>
      </Group>
      <Group>
        <Text
          component="div"
          size="sm"
          c={empty ? "dimmed" : undefined}
          fs={empty ? "italic" : undefined}
          ta="right"
        >
          {value}
        </Text>
      </Group>
    </Group>
  );
}
