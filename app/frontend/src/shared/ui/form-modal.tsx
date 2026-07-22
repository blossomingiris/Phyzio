import { getApiErrorMessage, isGeneralError } from "@/shared/api/errors";
import {
  Alert,
  Button,
  Divider,
  Group,
  Modal,
  Stack,
  Text,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import type { ReactNode, SubmitEventHandler } from "react";

export function FormModal({
  opened,
  onClose,
  title,
  submitLabel,
  onSubmit,
  isPending,
  error,
  children,
  size = "xl",
}: {
  opened: boolean;
  onClose: () => void;
  title: string;
  submitLabel: string;
  onSubmit: SubmitEventHandler<HTMLFormElement>;
  isPending?: boolean;
  error?: unknown;
  children: ReactNode;
  size?: string;
}) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size={size}
      title={
        <Text fw={700} size="xl">
          {title}
        </Text>
      }
    >
      <form onSubmit={onSubmit}>
        <Stack gap="lg">
          {isGeneralError(error) && (
            <Alert color="error" variant="light" icon={<IconAlertCircle />}>
              {getApiErrorMessage(error)}
            </Alert>
          )}

          {children}

          <Divider my="10" />

          <Group justify="flex-end" gap="lg">
            <Button variant="default" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={isPending}>
              {submitLabel}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
