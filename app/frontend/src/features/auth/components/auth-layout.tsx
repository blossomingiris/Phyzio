import { Center, Paper, Stack, Text, Title } from "@mantine/core";
import type { ReactNode } from "react";

export function AuthLayout({
  title,
  description,
  children,
  footer,
}: {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Center mih="100vh" p="md" bg="var(--surface-subtle)">
      <Stack maw={400} w="100%">
        <Stack gap={4}>
          <Title ta="center" order={1} size="h2">
            {title}
          </Title>
          {description && (
            <Text ta="center" c="dimmed" size="sm">
              {description}
            </Text>
          )}
        </Stack>
        <Paper withBorder shadow="sm" p="xl">
          {children}
          {footer && <Center>{footer}</Center>}
        </Paper>
      </Stack>
    </Center>
  );
}
