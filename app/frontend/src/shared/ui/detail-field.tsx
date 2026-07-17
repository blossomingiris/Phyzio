import { Box, Text } from "@mantine/core";
import type { Icon } from "@tabler/icons-react";
import type { ReactNode } from "react";

export function DetailField({
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
    <Box
      style={{
        display: "grid",
        gridTemplateColumns: "20px 200px max-content",
        columnGap: "var(--mantine-spacing-xs)",
        alignItems: "center",
      }}
    >
      <FieldIcon size={16} stroke={1.5} color="var(--mantine-color-dimmed)" />
      <Text size="sm" c="dimmed" style={{ whiteSpace: "nowrap" }}>
        {label}
      </Text>
      <Text
        size="sm"
        c={empty ? "dimmed" : undefined}
        fs={empty ? "italic" : undefined}
        ta="right"
      >
        {value}
      </Text>
    </Box>
  );
}
