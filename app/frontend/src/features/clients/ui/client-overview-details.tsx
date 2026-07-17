import {
  CLIENT_ORIGIN_LABELS,
  PREFERRED_COMMUNICATION_LABELS,
  type ClientDetail,
} from "@/shared/domain/client";
import { calculateAge, formatDate } from "@/shared/lib/date/format-date";
import { ROUTES } from "@/shared/model/routes";
import { CardDetailField } from "@/shared/ui/card-detail-field";
import { SectionLabel } from "@/shared/ui/section-label";
import { Anchor, Divider, Group, Stack, Text } from "@mantine/core";
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
} from "@tabler/icons-react";
import { Link } from "react-router";

const NOT_PROVIDED = "Not provided";

function ClientPersonalDetails({ client }: { client: ClientDetail }) {
  return (
    <Stack gap="lg">
      <Stack gap="xs">
        <SectionLabel>Contact</SectionLabel>
        <CardDetailField
          icon={IconPhone}
          label="Phone"
          value={client.phone ?? NOT_PROVIDED}
          empty={!client.phone}
        />
        <CardDetailField
          icon={IconMail}
          label="Email"
          value={client.email ?? NOT_PROVIDED}
          empty={!client.email}
        />
        <CardDetailField
          icon={IconMessageCircle}
          label="Preferred Communication"
          value={
            client.preferredCommunication
              ? PREFERRED_COMMUNICATION_LABELS[client.preferredCommunication]
              : NOT_PROVIDED
          }
          empty={!client.preferredCommunication}
        />
        <CardDetailField
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
        <CardDetailField
          icon={IconCake}
          label="Birth Date"
          value={
            client.birthDate
              ? `${formatDate(client.birthDate)} (${calculateAge(client.birthDate)} y.o.)`
              : NOT_PROVIDED
          }
          empty={!client.birthDate}
        />
        <CardDetailField
          icon={IconStethoscope}
          label="Therapist"
          value={
            client.therapist ? (
              <Anchor
                component={Link}
                to={`${ROUTES.THERAPISTS}/${client.therapist.id}`}
                size="sm"
                underline="always"
              >
                {client.therapist.firstName} {client.therapist.lastName}
              </Anchor>
            ) : (
              NOT_PROVIDED
            )
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
        <IconUserX size={32} stroke={1.5} color="var(--mantine-color-dimmed)" />
        <Text size="sm" c="dimmed" ta="center">
          This client was deleted. Details are no longer shown.
        </Text>
      </Stack>

      <Divider />

      <Group gap="xl" justify="space-between">
        <Group gap="xs">
          <IconCalendarPlus
            size={16}
            stroke={1.5}
            color="var(--mantine-color-dimmed)"
          />
          <Text size="sm" c="dimmed">
            Created
          </Text>
          <Text size="sm">{formatDate(client.createdAt)}</Text>
        </Group>
        <Group gap="xs">
          <IconTrash
            size={16}
            stroke={1.5}
            color="var(--mantine-color-dimmed)"
          />
          <Text size="sm" c="dimmed">
            Deleted
          </Text>
          <Text size="sm">{formatDate(client.deletedAt)}</Text>
        </Group>
      </Group>
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

      <CardDetailField
        icon={IconCalendarPlus}
        label="Created"
        value={formatDate(client.createdAt)}
      />
    </Stack>
  );
}
