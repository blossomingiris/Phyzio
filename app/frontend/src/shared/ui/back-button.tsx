import { useCanGoBack } from "@/shared/lib/react/use-can-go-back";
import { Button } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { Link, useNavigate } from "react-router";

/**
 * `to` is the fallback parent route, used when there's no in-app history to
 * go back to (e.g. the page was opened directly via a bookmark or new tab).
 * Otherwise this navigates back one step in history, landing on whatever the
 * user actually came from — query string, scroll position, and all.
 */
export function BackButton({ to }: { to: string }) {
  const canGoBack = useCanGoBack();
  const navigate = useNavigate();

  if (canGoBack) {
    return (
      <Button
        onClick={() => navigate(-1)}
        variant="transparent"
        c="dimmed"
        leftSection={<IconArrowLeft size={16} />}
      >
        Back
      </Button>
    );
  }

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
