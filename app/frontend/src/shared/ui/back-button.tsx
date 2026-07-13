import { Button } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { Link } from "react-router";

export function BackButton({ to }: { to: string }) {
  return (
    <Button
      component={Link}
      to={to}
      variant="transparent"
      c="dimmed"
      leftSection={<IconArrowLeft size={16} />}
    >
      Back
    </Button>
  );
}
