import { Button, Group, Modal, Stack, Text } from "@mantine/core";
import type { ConfirmationDialogParams } from "./types";

export function ConfirmationDialog({
  params,
}: {
  params: ConfirmationDialogParams;
}) {
  const {
    title,
    description,
    confirmLabel,
    cancelLabel,
    confirmVariant,
    onConfirm,
    onCancel,
  } = params;

  return (
    <Modal
      opened
      onClose={onCancel}
      title={
        <Text fw={700} size="lg">
          {title}
        </Text>
      }
    >
      <Stack gap="lg">
        <Text size="sm">{description}</Text>

        <Group justify="flex-end">
          <Button variant="default" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            color={confirmVariant === "destructive" ? "error" : undefined}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
