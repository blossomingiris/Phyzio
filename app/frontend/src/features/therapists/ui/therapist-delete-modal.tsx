import { getApiErrorMessage } from "@/shared/api/errors";
import { rqClient } from "@/shared/api/http-client";
import type { Therapist } from "@/shared/domain/therapist";
import { useActiveTherapistsQuery } from "@/shared/model/use-active-therapists-query";
import {
  Alert,
  Button,
  Divider,
  Group,
  Loader,
  Modal,
  ScrollArea,
  Select,
  Stack,
  Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle, IconCheck } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { Fragment, useState } from "react";
import { useDeleteTherapist } from "../model/use-delete-therapist";

const ASSIGNMENT_GRID_COLUMNS = "1fr 280px";

export function TherapistDeleteModal({
  therapist,
  opened,
  onClose,
}: {
  therapist: Therapist;
  opened: boolean;
  onClose: () => void;
}) {
  const [assignments, setAssignments] = useState<Record<number, string | null>>(
    {},
  );
  const [bulkTarget, setBulkTarget] = useState<string | null>(null);
  const [reassignError, setReassignError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clientsQuery = rqClient.useQuery(
    "get",
    "/clients/",
    { params: { query: { therapistId: therapist.id, limit: 100 } } },
    { enabled: opened },
  );
  const activeTherapistsQuery = useActiveTherapistsQuery();
  const reassignClient = rqClient.useMutation("patch", "/clients/{id}");
  const deleteTherapist = useDeleteTherapist();
  const queryClient = useQueryClient();

  const affectedClients = clientsQuery.data?.data ?? [];
  const hasAffectedClients = affectedClients.length > 0;
  const availableTargets = (activeTherapistsQuery.data?.data ?? []).filter(
    (candidate) => candidate.id !== therapist.id,
  );
  const noValidTarget =
    hasAffectedClients &&
    !availableTargets.some((candidate) => candidate.isActive);
  const isLoading = clientsQuery.isLoading || activeTherapistsQuery.isLoading;
  const canDelete =
    !isLoading &&
    !noValidTarget &&
    affectedClients.every((client) => !!assignments[client.id]) &&
    !isSubmitting;

  const therapistName = `${therapist.firstName} ${therapist.lastName}`;
  const therapistOptions = availableTargets.map((candidate) => ({
    value: String(candidate.id),
    label: candidate.isActive
      ? `${candidate.firstName} ${candidate.lastName}`
      : `${candidate.firstName} ${candidate.lastName} (Unavailable)`,
    disabled: !candidate.isActive,
  }));

  const handleBulkAssign = (value: string | null) => {
    setBulkTarget(value);
    // Applies to every client uniformly — including clearing (value: null),
    // since all of them are guaranteed to still match the bulk value here
    // (an individual override would have already nulled bulkTarget).
    setAssignments(
      Object.fromEntries(affectedClients.map((client) => [client.id, value])),
    );
  };

  const handleAssignmentChange = (clientId: number, value: string | null) => {
    if (bulkTarget && value !== bulkTarget) {
      // Diverging from a uniform bulk assignment invalidates the "All
      // clients" selector, but every other client's already-chosen
      // assignment is still a valid choice — leave it as is.
      setBulkTarget(null);
    }
    setAssignments((prev) => ({ ...prev, [clientId]: value }));
  };

  const handleClose = () => {
    setAssignments({});
    setBulkTarget(null);
    setReassignError(null);
    onClose();
  };

  const handleDelete = async () => {
    setReassignError(null);
    setIsSubmitting(true);

    try {
      if (hasAffectedClients) {
        try {
          await Promise.all(
            affectedClients.map((client) =>
              reassignClient.mutateAsync({
                params: { path: { id: client.id } },
                body: { therapistId: Number(assignments[client.id]) },
              }),
            ),
          );
          queryClient.invalidateQueries({ queryKey: ["get", "/clients/"] });
          queryClient.invalidateQueries({
            queryKey: ["get", "/clients/{id}"],
          });
          notifications.show({
            color: "success",
            icon: <IconCheck size={18} />,
            message:
              affectedClients.length === 1
                ? "1 client was reassigned."
                : `${affectedClients.length} clients were reassigned.`,
          });
        } catch (error) {
          setReassignError(getApiErrorMessage(error));
          return;
        }
      }

      try {
        await deleteTherapist.mutateAsync({
          params: { path: { id: therapist.id } },
        });
        handleClose();
      } catch {
        // useDeleteTherapist already surfaces a notification on failure.
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      size="lg"
      title={
        <Text fw={700} size="xl">
          Delete Therapist
        </Text>
      }
    >
      <Stack gap="xl">
        {isLoading && <Loader size="sm" />}

        {!isLoading && !hasAffectedClients && (
          <Text size="md">
            Are you sure you want to delete <b>{therapistName}</b>? This
            action cannot be undone.
          </Text>
        )}

        {!isLoading && hasAffectedClients && noValidTarget && (
          <Alert color="error" icon={<IconAlertCircle />}>
            <b>{therapistName}</b> has clients assigned, but there is no other
            active therapist available to reassign them to. Add or activate
            another therapist before deleting this one.
          </Alert>
        )}

        {!isLoading && hasAffectedClients && !noValidTarget && (
          <Stack gap="lg">
            <Alert color="error" icon={<IconAlertCircle />}>
              <b>{therapistName}</b> has clients assigned — reassign each one to
              another active therapist below before deleting.
            </Alert>

            <Stack gap="xs">
              {affectedClients.length === 1 && (
                <Text size="sm" c="dimmed">
                  Choose a therapist to reassign this client to.
                </Text>
              )}

              {affectedClients.length > 1 && (
                <Text size="sm" c="dimmed">
                  Pick a therapist for each client individually:
                </Text>
              )}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: ASSIGNMENT_GRID_COLUMNS,
                  columnGap: "var(--mantine-spacing-md)",
                  rowGap: "var(--mantine-spacing-xs)",
                  alignItems: "center",
                  padding: "4px",
                  marginTop: "10px",
                }}
              >
                <Text size="xs" fw={600} tt="uppercase">
                  Client
                </Text>
                <Text size="xs" fw={600} tt="uppercase">
                  Reassign to
                </Text>
              </div>

              <ScrollArea.Autosize mah={360}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: ASSIGNMENT_GRID_COLUMNS,
                    columnGap: "var(--mantine-spacing-md)",
                    rowGap: "var(--mantine-spacing-xs)",
                    alignItems: "center",
                    padding: "4px",
                  }}
                >
                  {affectedClients.map((client) => (
                    <Fragment key={client.id}>
                      <Text size="sm">
                        {client.firstName} {client.lastName}
                      </Text>
                      <Select
                        aria-label={`Reassign ${client.firstName} ${client.lastName} to`}
                        placeholder="Select a therapist"
                        data={therapistOptions}
                        value={assignments[client.id] ?? null}
                        onChange={(value) =>
                          handleAssignmentChange(client.id, value)
                        }
                        searchable
                        clearable
                      />
                    </Fragment>
                  ))}
                </div>
              </ScrollArea.Autosize>
            </Stack>

            {affectedClients.length > 1 && (
              <Stack gap="xs">
                <Divider />

                <Text size="sm" c="dimmed">
                  Or assign all clients to the same therapist:
                </Text>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: ASSIGNMENT_GRID_COLUMNS,
                    columnGap: "var(--mantine-spacing-md)",
                    alignItems: "center",
                    padding: "4px",
                  }}
                >
                  <Text size="sm">All clients</Text>
                  <Select
                    aria-label="Assign all clients to"
                    placeholder="Select a therapist"
                    data={therapistOptions}
                    value={bulkTarget}
                    onChange={handleBulkAssign}
                    searchable
                    clearable
                  />
                </div>
              </Stack>
            )}
          </Stack>
        )}

        {reassignError && (
          <Alert color="error" variant="light" icon={<IconAlertCircle />}>
            {reassignError}
          </Alert>
        )}

        <Group justify="flex-end">
          <Button variant="default" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            color="error"
            onClick={handleDelete}
            disabled={!canDelete}
            loading={isSubmitting}
          >
            Delete Therapist
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
