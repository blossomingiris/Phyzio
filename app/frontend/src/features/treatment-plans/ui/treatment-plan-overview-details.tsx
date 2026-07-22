import { TREATMENT_CATEGORY_LABELS } from "@/shared/domain/treatment";
import {
  TREATMENT_PLAN_CANCELLATION_REASON_LABELS,
  type TreatmentPlanDetail,
} from "@/shared/domain/treatment-plan";
import { formatDate } from "@/shared/lib/date/format-date";
import { ROUTES } from "@/shared/model/routes";
import { CardDetailField } from "@/shared/ui/card-detail-field";
import { TreatmentPlanProgressCell } from "@/shared/ui/treatment-plan-progress-cell";
import {
  Accordion,
  Anchor,
  Badge,
  Divider,
  Group,
  Stack,
  Text,
} from "@mantine/core";
import {
  IconAlertTriangle,
  IconBan,
  IconCalendarEvent,
  IconCalendarPlus,
  IconChartBar,
  IconClipboardList,
  IconFileText,
  IconStethoscope,
  IconUser,
  type Icon,
} from "@tabler/icons-react";
import { Link } from "react-router";

const NOT_PROVIDED = "Not provided";

function LongTextField({
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
    <Stack gap={4}>
      <Group gap="xs">
        <FieldIcon size={16} stroke={1.5} color="var(--mantine-color-dimmed)" />
        <Text size="sm" c="dimmed">
          {label}
        </Text>
      </Group>
      <Text
        size="sm"
        c={empty ? "dimmed" : undefined}
        fs={empty ? "italic" : undefined}
      >
        {value}
      </Text>
    </Stack>
  );
}

function TreatmentPlanPeople({ plan }: { plan: TreatmentPlanDetail }) {
  return (
    <Stack gap="lg">
      <CardDetailField
        icon={IconUser}
        label="Client"
        value={
          <Anchor
            component={Link}
            to={`${ROUTES.CLIENTS}/${plan.client.id}`}
            size="sm"
            underline="always"
          >
            {plan.client.firstName} {plan.client.lastName}
          </Anchor>
        }
      />
      <CardDetailField
        icon={IconStethoscope}
        label="Therapist"
        value={
          <Group gap="xs" justify="flex-end">
            <Anchor
              component={Link}
              to={`${ROUTES.THERAPISTS}/${plan.therapist.id}`}
              size="sm"
              underline="always"
            >
              {plan.therapist.firstName} {plan.therapist.lastName}
            </Anchor>
            {!plan.therapist.isActive && (
              <Badge color="accent" variant="light" size="xs">
                Unavailable
              </Badge>
            )}
          </Group>
        }
      />
    </Stack>
  );
}

function TreatmentPlanClinical({ plan }: { plan: TreatmentPlanDetail }) {
  return (
    <Stack gap="lg">
      <LongTextField
        icon={IconFileText}
        label="Primary Diagnostic"
        value={plan.primaryDiagnostic}
      />
      <LongTextField
        icon={IconClipboardList}
        label="Clinical Goals"
        value={plan.clinicalGoals}
      />
      <LongTextField
        icon={IconAlertTriangle}
        label="Contraindications"
        value={plan.contraindications ?? NOT_PROVIDED}
        empty={!plan.contraindications}
      />
    </Stack>
  );
}

function TreatmentPlanScheduleAndStatus({
  plan,
}: {
  plan: TreatmentPlanDetail;
}) {
  return (
    <Stack gap="lg">
      <CardDetailField
        icon={IconCalendarPlus}
        label="Start Date"
        value={formatDate(plan.startDate)}
      />
      <CardDetailField
        icon={IconCalendarEvent}
        label="End Date"
        value={plan.endDate ? formatDate(plan.endDate) : "Ongoing"}
        empty={!plan.endDate}
      />
      <Stack gap={4}>
        <Group gap="xs">
          <IconChartBar
            size={16}
            stroke={1.5}
            color="var(--mantine-color-dimmed)"
          />
          <Text size="sm" c="dimmed">
            Progress
          </Text>
        </Group>
        <TreatmentPlanProgressCell plan={plan} />
      </Stack>
      {plan.cancellationReason && (
        <>
          <CardDetailField
            icon={IconBan}
            label="Cancellation Reason"
            value={
              TREATMENT_PLAN_CANCELLATION_REASON_LABELS[plan.cancellationReason]
            }
          />
          {plan.cancellationNote && (
            <LongTextField
              icon={IconFileText}
              label="Cancellation Note"
              value={plan.cancellationNote}
            />
          )}
        </>
      )}
    </Stack>
  );
}

function TreatmentPlanItemRow({
  item,
}: {
  item: TreatmentPlanDetail["items"][number];
}) {
  const vatPercent = Math.round(item.treatment.vatRate * 100);

  return (
    <Group justify="space-between" wrap="nowrap" align="flex-start">
      <Stack gap={0}>
        <Anchor
          component={Link}
          to={`${ROUTES.TREATMENTS}/${item.treatment.id}`}
          size="sm"
          underline="always"
        >
          {item.treatment.name}
        </Anchor>
        <Text size="xs" c="dimmed">
          {TREATMENT_CATEGORY_LABELS[item.treatment.category]}
        </Text>
      </Stack>
      <Stack gap={0} align="flex-end">
        <Text size="sm">
          {item.quantityCompleted}/{item.treatment.quantity} sessions
        </Text>
        <Text size="xs" c="dimmed">
          {item.treatment.pricePerUnit} × {item.treatment.quantity} ={" "}
          {item.treatment.totalAmount} (excl. VAT)
        </Text>
        <Text size="xs" c="dimmed">
          + VAT ({vatPercent}%): {item.treatment.vatAmount}
        </Text>
        <Text size="xs" fw={600}>
          Total: {item.treatment.totalWithVat} (incl. VAT)
        </Text>
      </Stack>
    </Group>
  );
}

function getTreatmentPlanTotals(plan: TreatmentPlanDetail) {
  return plan.items.reduce(
    (totals, item) => ({
      subtotal: totals.subtotal + Number(item.treatment.totalAmount ?? 0),
      vat: totals.vat + Number(item.treatment.vatAmount ?? 0),
      total: totals.total + Number(item.treatment.totalWithVat ?? 0),
    }),
    { subtotal: 0, vat: 0, total: 0 },
  );
}

function TreatmentPlanTreatments({ plan }: { plan: TreatmentPlanDetail }) {
  if (plan.items.length === 0) {
    return (
      <Text size="sm" c="dimmed" fs="italic">
        No treatments added
      </Text>
    );
  }

  const totals = getTreatmentPlanTotals(plan);

  return (
    <Stack gap="md">
      {plan.items.map((item) => (
        <TreatmentPlanItemRow key={item.id} item={item} />
      ))}

      <Divider />

      <Group justify="space-between" wrap="nowrap">
        <Text size="sm" fw={600}>
          Total
        </Text>
        <Stack gap={0} align="flex-end">
          <Text size="xs" c="dimmed">
            Subtotal: {totals.subtotal.toFixed(2)} (excl. VAT)
          </Text>
          <Text size="xs" c="dimmed">
            VAT: {totals.vat.toFixed(2)}
          </Text>
          <Text size="sm" fw={700}>
            {totals.total.toFixed(2)} (incl. VAT)
          </Text>
        </Stack>
      </Group>
    </Stack>
  );
}

export function TreatmentPlanOverviewDetails({
  plan,
}: {
  plan: TreatmentPlanDetail;
}) {
  return (
    <Accordion
      multiple
      defaultValue={["people"]}
      variant="separated"
      styles={{ label: { fontWeight: 600 } }}
    >
      <Accordion.Item value="people">
        <Accordion.Control>Client & Therapist</Accordion.Control>
        <Accordion.Panel>
          <TreatmentPlanPeople plan={plan} />
        </Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item value="clinical">
        <Accordion.Control>Clinical</Accordion.Control>
        <Accordion.Panel>
          <TreatmentPlanClinical plan={plan} />
        </Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item value="schedule">
        <Accordion.Control>Progress</Accordion.Control>
        <Accordion.Panel>
          <TreatmentPlanScheduleAndStatus plan={plan} />
        </Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item value="treatments">
        <Accordion.Control>Treatments & Pricing</Accordion.Control>
        <Accordion.Panel>
          <TreatmentPlanTreatments plan={plan} />
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}
