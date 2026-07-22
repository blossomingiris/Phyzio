import { USER_ROLE_LABELS, type AdminUser } from "@/shared/domain/user";
import { formatDate } from "@/shared/lib/date/format-date";
import { CardDetailField } from "@/shared/ui/card-detail-field";
import { SectionLabel } from "@/shared/ui/section-label";
import { Badge, Divider, Group, Stack, Text } from "@mantine/core";
import {
  IconCalendarPlus,
  IconMail,
  IconShieldHalf,
  IconTrash,
  IconUserX,
} from "@tabler/icons-react";

function UserPersonalDetails({ user }: { user: AdminUser }) {
  return (
    <Stack gap="lg">
      <Stack gap="xs">
        <SectionLabel>Contact</SectionLabel>
        <CardDetailField icon={IconMail} label="Email" value={user.email} />
      </Stack>

      <Divider />

      <Stack gap="xs">
        <SectionLabel>Access</SectionLabel>
        <CardDetailField
          icon={IconShieldHalf}
          label="Role"
          value={
            <Badge
              color={user.role === "admin" ? "primary" : "accent"}
              variant="light"
            >
              {USER_ROLE_LABELS[user.role]}
            </Badge>
          }
        />
      </Stack>
    </Stack>
  );
}

function UserDeletedSummary({ user }: { user: AdminUser }) {
  return (
    <Stack gap="lg">
      <Stack align="center" gap="xs" py="md">
        <IconUserX size={32} stroke={1.5} color="var(--mantine-color-dimmed)" />
        <Text size="sm" c="dimmed" ta="center">
          This user was deleted. Details are no longer shown.
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
          <Text size="sm">{formatDate(user.createdAt)}</Text>
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
          <Text size="sm">{formatDate(user.deletedAt)}</Text>
        </Group>
      </Group>
    </Stack>
  );
}

export function UserOverviewDetails({ user }: { user: AdminUser }) {
  if (user.deletedAt) {
    return <UserDeletedSummary user={user} />;
  }

  return (
    <Stack gap="lg">
      <UserPersonalDetails user={user} />

      <Divider />

      <CardDetailField
        icon={IconCalendarPlus}
        label="Created"
        value={formatDate(user.createdAt)}
      />
    </Stack>
  );
}
