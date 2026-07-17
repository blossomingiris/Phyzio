import { TREATMENT_CATEGORY_LABELS, type TreatmentDetail } from "@/shared/domain/treatment";
import { formatDate } from "@/shared/lib/date/format-date";
import { DetailField } from "@/shared/ui/detail-field";
import { SectionLabel } from "@/shared/ui/section-label";
import { Divider, Group, Stack, Text } from "@mantine/core";
import {
  IconCalendarPlus,
  IconCash,
  IconClock,
  IconPercentage,
  IconReceipt,
  IconRoute,
  IconStack2,
} from "@tabler/icons-react";

export function TreatmentOverviewDetails({
  treatment,
}: {
  treatment: TreatmentDetail;
}) {
  return (
    <Stack gap="lg">
      <Stack gap="xs">
        <SectionLabel>Description</SectionLabel>
        <Text
          size="sm"
          c={treatment.description ? undefined : "dimmed"}
          fs={treatment.description ? undefined : "italic"}
        >
          {treatment.description ?? "No description provided"}
        </Text>
      </Stack>

      <Divider />

      <Stack gap="xs">
        <SectionLabel>Details</SectionLabel>
        <DetailField
          icon={IconRoute}
          label="Category"
          value={TREATMENT_CATEGORY_LABELS[treatment.category]}
        />
        <DetailField
          icon={IconClock}
          label="Duration"
          value={`${treatment.durationMinutes} min`}
        />
        <DetailField
          icon={IconStack2}
          label="Quantity"
          value={String(treatment.quantity)}
        />
      </Stack>

      <Divider />

      <Stack gap="xs">
        <SectionLabel>Pricing</SectionLabel>
        <DetailField
          icon={IconCash}
          label="Price per Unit"
          value={treatment.pricePerUnit}
        />
        <DetailField
          icon={IconPercentage}
          label="VAT"
          value={`${treatment.vatRate * 100}%`}
        />
        <DetailField
          icon={IconReceipt}
          label="Total with VAT"
          value={treatment.totalWithVat ?? "—"}
        />
      </Stack>

      <Divider />

      <Stack gap="xs">
        <SectionLabel>History</SectionLabel>
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
            <Text size="sm">{formatDate(treatment.createdAt)}</Text>
          </Group>
          <Group gap="xs">
            <IconCalendarPlus
              size={16}
              stroke={1.5}
              color="var(--mantine-color-dimmed)"
            />
            <Text size="sm" c="dimmed">
              Updated
            </Text>
            <Text size="sm">{formatDate(treatment.updatedAt)}</Text>
          </Group>
        </Group>
      </Stack>
    </Stack>
  );
}
