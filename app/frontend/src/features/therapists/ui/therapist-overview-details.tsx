import { SPECIALITY_LABELS, type Therapist } from "@/shared/domain/therapist";
import { formatDate } from "@/shared/lib/date/format-date";
import { CardDetailField } from "@/shared/ui/card-detail-field";
import { SectionLabel } from "@/shared/ui/section-label";
import { Badge, Divider, Group, Stack, Text } from "@mantine/core";
import {
  IconCalendarPlus,
  IconClock,
  IconMail,
  IconPhone,
  IconStethoscope,
  IconTrash,
  IconUserCheck,
  IconUserX,
} from "@tabler/icons-react";
import { WEEKDAYS } from "@/services/working-hours";

const DAY_SHORT_LABELS: Record<(typeof WEEKDAYS)[number], string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

function TherapistWorkingHoursField({
  workingHours,
}: {
  workingHours: Therapist["workingHours"];
}) {
  const days = WEEKDAYS.filter((day) => workingHours[day]?.length);

  return (
    <Group gap="xl" justify="space-between" align="flex-start">
      <Group gap="xs">
        <IconClock size={16} stroke={1.5} color="var(--mantine-color-dimmed)" />
        <Text size="sm" c="dimmed" style={{ whiteSpace: "nowrap" }}>
          Working Hours
        </Text>
      </Group>
      {days.length ? (
        <Stack gap={2}>
          {days.map((day) => {
            const slot = workingHours[day]![0];
            return (
              <Text key={day} size="sm" ta="right">
                {DAY_SHORT_LABELS[day]} {slot.start}–{slot.end}
              </Text>
            );
          })}
        </Stack>
      ) : (
        <Text size="sm" c="dimmed" fs="italic" ta="right">
          Not set
        </Text>
      )}
    </Group>
  );
}

function TherapistPersonalDetails({ therapist }: { therapist: Therapist }) {
  return (
    <Stack gap="lg">
      <Stack gap="xs">
        <SectionLabel>Contact</SectionLabel>
        <CardDetailField
          icon={IconMail}
          label="Email"
          value={therapist.email}
        />
        <CardDetailField
          icon={IconPhone}
          label="Phone"
          value={therapist.phone}
        />
      </Stack>

      <Divider />

      <Stack gap="xs">
        <SectionLabel>Professional</SectionLabel>
        <CardDetailField
          icon={IconStethoscope}
          label="Speciality"
          value={SPECIALITY_LABELS[therapist.speciality]}
        />
        <TherapistWorkingHoursField workingHours={therapist.workingHours} />
        <CardDetailField
          icon={IconUserCheck}
          label="Availability"
          value={
            <Badge color={therapist.isActive ? "success" : "accent"} variant="light">
              {therapist.isActive ? "Available" : "Unavailable"}
            </Badge>
          }
        />
      </Stack>
    </Stack>
  );
}

function TherapistDeletedSummary({ therapist }: { therapist: Therapist }) {
  return (
    <Stack gap="lg">
      <Stack align="center" gap="xs" py="md">
        <IconUserX size={32} stroke={1.5} color="var(--mantine-color-dimmed)" />
        <Text size="sm" c="dimmed" ta="center">
          This therapist was deleted. Details are no longer shown.
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
          <Text size="sm">{formatDate(therapist.createdAt)}</Text>
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
          <Text size="sm">{formatDate(therapist.deletedAt)}</Text>
        </Group>
      </Group>
    </Stack>
  );
}

export function TherapistOverviewDetails({
  therapist,
}: {
  therapist: Therapist;
}) {
  if (therapist.deletedAt) {
    return <TherapistDeletedSummary therapist={therapist} />;
  }

  return (
    <Stack gap="lg">
      <TherapistPersonalDetails therapist={therapist} />

      <Divider />

      <CardDetailField
        icon={IconCalendarPlus}
        label="Created"
        value={formatDate(therapist.createdAt)}
      />
    </Stack>
  );
}
