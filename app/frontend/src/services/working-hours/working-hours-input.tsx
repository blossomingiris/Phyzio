import { SectionLabel } from "@/shared/ui/section-label";
import { SwitchField } from "@/shared/ui/switch-field";
import { Button, Group, Radio, Select, Stack, Text } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import { IconCalendarWeek, IconCopy } from "@tabler/icons-react";
import { Fragment, useState } from "react";
import {
  WEEKDAYS,
  type DayHoursFormValues,
  type Weekday,
  type WorkingHoursFormValues,
} from "./working-hours-form-values";

const DAY_LABELS: Record<Weekday, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

const WEEKDAY_DAYS: Weekday[] = ["mon", "tue", "wed", "thu", "fri"];
const WEEKEND_DAYS: Weekday[] = ["sat", "sun"];

function formatTimeLabel(hour24: number, minute: number): string {
  const period = hour24 < 12 ? "AM" : "PM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${minute === 0 ? "00" : "30"} ${period}`;
}

const BUSINESS_START_HOUR = 8; // 8:00 AM
const BUSINESS_END_HOUR = 22; // 10:00 PM

const TIME_OPTIONS = Array.from(
  { length: (BUSINESS_END_HOUR - BUSINESS_START_HOUR) * 2 + 1 },
  (_, i) => {
    const totalMinutes = BUSINESS_START_HOUR * 60 + i * 30;
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    const value = `${String(hour).padStart(2, "0")}:${minute === 0 ? "00" : "30"}`;
    return { value, label: formatTimeLabel(hour, minute) };
  },
);

const APPLY_OPTIONS: { value: string; label: string; days: Weekday[] }[] = [
  { value: "all", label: "All days", days: [...WEEKDAYS] },
  { value: "weekdays", label: "Weekdays only", days: WEEKDAY_DAYS },
  { value: "weekend", label: "Weekend only", days: WEEKEND_DAYS },
];

function detectApplyScope(
  workingHours: Record<Weekday, DayHoursFormValues>,
): string | null {
  for (const option of APPLY_OPTIONS) {
    const enabledDays = new Set(option.days);
    const matches = WEEKDAYS.every(
      (day) => workingHours[day].enabled === enabledDays.has(day),
    );
    if (matches) return option.value;
  }
  return null;
}

function detectUniformHours(
  workingHours: Record<Weekday, DayHoursFormValues>,
): { start: string; end: string } | null {
  const enabledDays = WEEKDAYS.filter((day) => workingHours[day].enabled);
  const firstDay = enabledDays[0];
  if (!firstDay) return null;

  const { start, end } = workingHours[firstDay];
  return enabledDays.every(
    (day) => workingHours[day].start === start && workingHours[day].end === end,
  )
    ? { start, end }
    : null;
}

export function WorkingHoursInput({
  form,
  sectionLabel,
}: {
  form: UseFormReturnType<{ workingHours: WorkingHoursFormValues }>;
  sectionLabel?: string;
}) {
  const workingHours = form.values.workingHours;
  const applyScope = detectApplyScope(workingHours);
  const uniformHours = detectUniformHours(workingHours);

  const canSummarize = applyScope !== null && uniformHours !== null;
  const [perDay, setPerDay] = useState(!canSummarize);
  if (!canSummarize && !perDay) setPerDay(true);

  const handleApply = (value: string) => {
    const option = APPLY_OPTIONS.find((o) => o.value === value);
    if (!option) return;

    const enabledDays = new Set(option.days);
    const template = form.values.workingHours[option.days[0]!];
    for (const day of WEEKDAYS) {
      if (enabledDays.has(day)) {
        form.setFieldValue(`workingHours.${day}`, {
          enabled: true,
          start: template.start,
          end: template.end,
        });
      } else {
        form.setFieldValue(`workingHours.${day}.enabled`, false);
      }
    }
  };

  const handleUniformTime = (field: "start" | "end", value: string | null) => {
    if (!value) return;
    for (const day of WEEKDAYS) {
      if (workingHours[day].enabled) {
        form.setFieldValue(`workingHours.${day}.${field}`, value);
      }
    }
  };

  const handleCollapse = () => {
    const enabledDays = WEEKDAYS.filter((day) => workingHours[day].enabled);
    const firstDay = enabledDays[0];
    if (firstDay) {
      const { start, end } = workingHours[firstDay];
      for (const day of enabledDays) {
        form.setFieldValue(`workingHours.${day}`, {
          enabled: true,
          start,
          end,
        });
      }
    }
    setPerDay(false);
  };

  return (
    <Stack gap="md">
      {sectionLabel && (
        <Stack gap="xs">
          <SectionLabel>{sectionLabel}</SectionLabel>
        </Stack>
      )}
      <Radio.Group value={applyScope} onChange={handleApply}>
        <Group gap="lg" wrap="wrap">
          {APPLY_OPTIONS.map((option) => (
            <Radio
              key={option.value}
              value={option.value}
              label={option.label}
              color="accent"
            />
          ))}
        </Group>
      </Radio.Group>

      {!perDay && uniformHours && (
        <Group gap="md" align="center">
          <Select
            w={130}
            data={TIME_OPTIONS}
            searchable
            allowDeselect={false}
            aria-label="Start time for every selected day"
            value={uniformHours.start}
            onChange={(value) => handleUniformTime("start", value)}
          />
          <Text c="dimmed" size="md">
            to
          </Text>
          <Select
            w={130}
            data={TIME_OPTIONS}
            searchable
            allowDeselect={false}
            aria-label="End time for every selected day"
            value={uniformHours.end}
            onChange={(value) => handleUniformTime("end", value)}
          />
          <Button
            variant="subtle"
            leftSection={<IconCalendarWeek size={16} />}
            onClick={() => setPerDay(true)}
          >
            Set hours per day
          </Button>
        </Group>
      )}

      {perDay && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(300px, auto) auto 30px auto",
              rowGap: "var(--mantine-spacing-xs)",
              columnGap: "var(--mantine-spacing-md)",
              alignItems: "center",
            }}
          >
            {WEEKDAYS.map((day) => {
              const enabled = workingHours[day].enabled;
              return (
                <Fragment key={day}>
                  <SwitchField
                    label={DAY_LABELS[day]}
                    color="accent"
                    {...form.getInputProps(`workingHours.${day}.enabled`, {
                      type: "checkbox",
                    })}
                  />
                  <Select
                    w={130}
                    data={TIME_OPTIONS}
                    searchable
                    allowDeselect={false}
                    aria-label={`${DAY_LABELS[day]} start time`}
                    disabled={!enabled}
                    {...form.getInputProps(`workingHours.${day}.start`)}
                  />
                  <Text c="dimmed" size="md">
                    to
                  </Text>
                  <Select
                    w={130}
                    data={TIME_OPTIONS}
                    searchable
                    allowDeselect={false}
                    aria-label={`${DAY_LABELS[day]} end time`}
                    disabled={!enabled}
                    {...form.getInputProps(`workingHours.${day}.end`)}
                  />
                </Fragment>
              );
            })}
          </div>

          {applyScope && (
            <Button
              variant="subtle"
              leftSection={<IconCopy size={16} />}
              onClick={handleCollapse}
              style={{ alignSelf: "flex-start" }}
            >
              Use the same hours every day
            </Button>
          )}
        </>
      )}
    </Stack>
  );
}
