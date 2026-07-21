import { SectionLabel } from "@/shared/ui/section-label";
import { SwitchField } from "@/shared/ui/switch-field";
import { Group, Radio, Select, Stack, Text } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import { Fragment, useState } from "react";
import {
  WEEKDAYS,
  type DayHoursFormValues,
  type TherapistFormValues,
  type Weekday,
} from "../model/therapist-form-values";

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

export function TherapistWorkingHoursInput({
  form,
}: {
  form: UseFormReturnType<TherapistFormValues>;
}) {
  const [applyScope, setApplyScope] = useState<string | null>(() =>
    detectApplyScope(form.values.workingHours),
  );

  if (applyScope && detectApplyScope(form.values.workingHours) !== applyScope) {
    setApplyScope(null);
  }

  const handleApply = (value: string) => {
    setApplyScope(value);
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

  return (
    <Stack gap="md">
      <SectionLabel>Working Hours</SectionLabel>

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
          const enabled = form.values.workingHours[day].enabled;
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
    </Stack>
  );
}
