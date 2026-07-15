import {
  CLIENT_ORIGIN_LABELS,
  PREFERRED_COMMUNICATION_LABELS,
  type ClientDetail,
} from "@/shared/domain/client";
import { calculateAge, formatDate } from "@/shared/lib/date/format-date";
import { Divider, Group, Stack, Text } from "@mantine/core";
import {
  IconCake,
  IconCalendarPlus,
  IconMail,
  IconMessageCircle,
  IconPhone,
  IconRoute,
  IconStethoscope,
  IconTrash,
  IconUserX,
  type Icon,
} from "@tabler/icons-react";

function Field({
  icon: FieldIcon,
  label,
  value,
  empty,
}: {
  icon: Icon;
  label: string;
  value: string;
  empty?: boolean;
}) {
  return (
    <Group gap="xs" wrap="nowrap">
      <FieldIcon size={16} stroke={1.5} color="var(--mantine-color-dimmed)" />
      <Text size="sm" w={200} c="dimmed" style={{ whiteSpace: "nowrap" }}>
        {label}
      </Text>
      <Text
        size="sm"
        c={empty ? "dimmed" : undefined}
        fs={empty ? "italic" : undefined}
      >
        {value}
      </Text>
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

const NOT_PROVIDED = "Not provided";

function ClientPersonalDetails({ client }: { client: ClientDetail }) {
  return (
    <Stack gap="lg">
      <Stack gap="xs">
        <SectionLabel>Contact</SectionLabel>
        <Field
          icon={IconPhone}
          label="Phone"
          value={client.phone ?? NOT_PROVIDED}
          empty={!client.phone}
        />
        <Field
          icon={IconMail}
          label="Email"
          value={client.email ?? NOT_PROVIDED}
          empty={!client.email}
        />
        <Field
          icon={IconMessageCircle}
          label="Preferred Communication"
          value={PREFERRED_COMMUNICATION_LABELS[client.preferredCommunication]}
        />
        <Field
          icon={IconRoute}
          label="Source"
          value={
            client.origin ? CLIENT_ORIGIN_LABELS[client.origin] : NOT_PROVIDED
          }
          empty={!client.origin}
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
              : NOT_PROVIDED
          }
          empty={!client.birthDate}
        />
        <Field
          icon={IconStethoscope}
          label="Therapist"
          value={
            client.therapist
              ? `${client.therapist.firstName} ${client.therapist.lastName}`
              : NOT_PROVIDED
          }
          empty={!client.therapist}
        />
      </Stack>

      <Divider />

      <Stack gap="xs">
        <SectionLabel>Medical Notes</SectionLabel>
        <Text
          size="sm"
          c={client.medicalNotes ? undefined : "dimmed"}
          fs={client.medicalNotes ? undefined : "italic"}
        >
          {client.medicalNotes ?? NOT_PROVIDED}
        </Text>
      </Stack>
    </Stack>
  );
}

function ClientDeletedSummary({ client }: { client: ClientDetail }) {
  return (
    <Stack gap="lg">
      <Stack align="center" gap="xs" py="md">
        <IconUserX
          size={32}
          stroke={1.5}
          color="var(--mantine-color-dimmed)"
        />
        <Text size="sm" c="dimmed" ta="center">
          This client was deleted. Details are no longer shown.
        </Text>
      </Stack>

      <Divider />

      <Field
        icon={IconCalendarPlus}
        label="Created"
        value={formatDate(client.createdAt)}
      />
      <Field
        icon={IconTrash}
        label="Deleted"
        value={formatDate(client.deletedAt)}
      />
    </Stack>
  );
}

export function ClientOverviewDetails({ client }: { client: ClientDetail }) {
  if (client.deletedAt) {
    return <ClientDeletedSummary client={client} />;
  }

  return (
    <Stack gap="lg">
      <ClientPersonalDetails client={client} />

      <Divider />

      <Field
        icon={IconCalendarPlus}
        label="Created"
        value={formatDate(client.createdAt)}
      />
    </Stack>
  );
}
