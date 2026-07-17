import { ROUTES } from "@/shared/model/routes";
import { Button, Center, Stack, Text, Title } from "@mantine/core";
import { IconMoodSadDizzy } from "@tabler/icons-react";
import { Link, isRouteErrorResponse, useRouteError } from "react-router";
export function RouteErrorBoundary() {
  const error = useRouteError();
  const isNotFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <Center mih="100vh" p="md" bg="var(--surface-subtle)">
      <Stack align="center" gap="xs" maw={400}>
        <IconMoodSadDizzy
          size={50}
          stroke={1.5}
          color="var(--mantine-color-error-6)"
        />
        <Title ta="center" order={1} size="h2">
          {isNotFound ? "Page not found" : "Something went wrong"}
        </Title>
        <Text ta="center" c="dimmed" size="sm">
          {isNotFound
            ? "The page you're looking for doesn't exist or may have been moved."
            : "An unexpected error occurred. Please try again."}
        </Text>
        <Button component={Link} to={ROUTES.HOME} mt="md">
          Back to Home
        </Button>
      </Stack>
    </Center>
  );
}
