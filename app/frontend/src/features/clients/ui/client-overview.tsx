import {
  CLIENT_ORIGIN_LABELS,
  PREFERRED_COMMUNICATION_LABELS,
  type ClientDetail,
} from "@/shared/domain/client";
import { calculateAge, formatDate } from "@/shared/lib/date/format-date";
import {
  Button,
  Card,
  Divider,
  Group,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import {
  IconCake,
  IconCalendarPlus,
  IconCheck,
  IconMail,
  IconMessageCircle,
  IconPencil,
  IconPhone,
  IconRoute,
  IconStethoscope,
  type Icon,
} from "@tabler/icons-react";
import { useState } from "react";
import { useTherapistsQuery } from "../use-therapists-query";

const PREFERRED_COMMUNICATION_OPTIONS = Object.entries(
  PREFERRED_COMMUNICATION_LABELS,
).map(([value, label]) => ({ value, label }));

const CLIENT_ORIGIN_OPTIONS = Object.entries(CLIENT_ORIGIN_LABELS).map(
  ([value, label]) => ({ value, label }),
);

function Field({
  icon: FieldIcon,
  label,
  value,
}: {
  icon: Icon;
  label: string;
  value: string;
}) {
  return (
    <Group gap="xs" wrap="nowrap">
      <FieldIcon size={16} stroke={1.5} color="var(--mantine-color-dimmed)" />
      <Text size="sm" w={160} c="dimmed">
        {label}
      </Text>
      <Text size="sm">{value}</Text>
    </Group>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <Text size="xs" fw={600} tt="uppercase" c="dimmed">
      {children}
    </Text>
  );
}

function ClientOverviewDetails({ client }: { client: ClientDetail }) {
  return (
    <Stack gap="lg">
      <Stack gap="xs">
        <SectionLabel>Contact</SectionLabel>
        <Field icon={IconPhone} label="Phone" value={client.phone ?? "—"} />
        <Field icon={IconMail} label="Email" value={client.email ?? "—"} />
        <Field
          icon={IconMessageCircle}
          label="Preferred Communication"
          value={PREFERRED_COMMUNICATION_LABELS[client.preferredCommunication]}
        />
        <Field
          icon={IconRoute}
          label="Source"
          value={client.origin ? CLIENT_ORIGIN_LABELS[client.origin] : "—"}
        />
      </Stack>

      <Divider />

      <Stack gap="xs">
        <SectionLabel>Personal</SectionLabel>
        <Field
          icon={IconCake}
          label="Birth Date"
          value={
            client.birthDate
              ? `${formatDate(client.birthDate)} (${calculateAge(client.birthDate)} y.o.)`
              : "—"
          }
        />
        <Field
          icon={IconStethoscope}
          label="Therapist"
          value={
            client.therapist
              ? `${client.therapist.firstName} ${client.therapist.lastName}`
              : "—"
          }
        />
      </Stack>

      <Divider />

      <Stack gap="xs">
        <SectionLabel>Medical Notes</SectionLabel>
        <Text size="sm">{client.medicalNotes ?? "—"}</Text>
      </Stack>
    </Stack>
  );
}

function ClientOverviewForm({ client }: { client: ClientDetail }) {
  const { data } = useTherapistsQuery();
  const therapistOptions = (data?.data ?? []).map((therapist) => ({
    value: String(therapist.id),
    label: therapist.isActive
      ? `${therapist.firstName} ${therapist.lastName}`
      : `${therapist.firstName} ${therapist.lastName} (Inactive)`,
    disabled: !therapist.isActive,
  }));

  return (
    <Stack gap="lg">
      <Stack gap="xs">
        <SectionLabel>Contact</SectionLabel>
        <TextInput
          label="Phone"
          leftSection={<IconPhone size={16} />}
          defaultValue={client.phone ?? ""}
        />
        <TextInput
          label="Email"
          leftSection={<IconMail size={16} />}
          defaultValue={client.email ?? ""}
        />
        <Select
          label="Preferred Communication"
          leftSection={<IconMessageCircle size={16} />}
          data={PREFERRED_COMMUNICATION_OPTIONS}
          defaultValue={client.preferredCommunication}
          allowDeselect={false}
        />
        <Select
          label="Source"
          leftSection={<IconRoute size={16} />}
          data={CLIENT_ORIGIN_OPTIONS}
          defaultValue={client.origin}
        />
      </Stack>

      <Divider />

      <Stack gap="xs">
        <SectionLabel>Personal</SectionLabel>
        <DateInput
          label="Birth Date"
          leftSection={<IconCake size={16} />}
          defaultValue={client.birthDate ?? null}
        />
        <Select
          label="Therapist"
          leftSection={<IconStethoscope size={16} />}
          data={therapistOptions}
          defaultValue={client.therapist ? String(client.therapist.id) : null}
          searchable
          clearable
        />
      </Stack>

      <Divider />

      <Stack gap="xs">
        <SectionLabel>Medical Notes</SectionLabel>
        <Textarea
          minRows={3}
          defaultValue={client.medicalNotes ?? ""}
          description="Only the treating therapist can edit medical notes"
          disabled
        />
      </Stack>
    </Stack>
  );
}

export function ClientOverview({ client }: { client: ClientDetail }) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <Card withBorder shadow="md" padding="xl" maw={640}>
      <Card.Section
        withBorder
        inheritPadding
        py="sm"
        mb="lg"
        pr="sm"
        bg="var(--surface-subtle)"
      >
        <Group justify="space-between">
          <Text fw={600}>Client Details</Text>
          {isEditing ? (
            <Group gap="xs">
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                leftSection={<IconCheck size={16} />}
                onClick={() => setIsEditing(false)}
              >
                Save
              </Button>
            </Group>
          ) : (
            <Button
              size="sm"
              leftSection={<IconPencil size={16} />}
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
          )}
        </Group>
      </Card.Section>

      <Stack gap="lg">
        {isEditing ? (
          <ClientOverviewForm client={client} />
        ) : (
          <ClientOverviewDetails client={client} />
        )}

        <Divider />

        <Field
          icon={IconCalendarPlus}
          label="Created"
          value={formatDate(client.createdAt)}
        />
      </Stack>
    </Card>
  );
}
