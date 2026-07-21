import { Badge } from "@mantine/core";

export function TabCountBadge({ count }: { count?: number }) {
  return (
    <Badge size="sm" variant="light" color="accent" miw={24}>
      {count ?? "–"}
    </Badge>
  );
}
