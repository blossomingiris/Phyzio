export const WEEKDAYS = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
] as const;
export type Weekday = (typeof WEEKDAYS)[number];

export type DayHoursFormValues = {
  enabled: boolean;
  start: string;
  end: string;
};
export type WorkingHoursFormValues = Record<Weekday, DayHoursFormValues>;

type WorkingHoursSlots = Partial<
  Record<Weekday, { start: string; end: string }[]>
>;

const EMPTY_DAY_HOURS: DayHoursFormValues = {
  enabled: false,
  start: "09:00",
  end: "17:00",
};

export function emptyWorkingHours(): WorkingHoursFormValues {
  return WEEKDAYS.reduce((acc, day) => {
    acc[day] = { ...EMPTY_DAY_HOURS };
    return acc;
  }, {} as WorkingHoursFormValues);
}

export function workingHoursToFormValues(
  workingHours: WorkingHoursSlots,
): WorkingHoursFormValues {
  const result = emptyWorkingHours();
  for (const day of WEEKDAYS) {
    const slot = workingHours[day]?.[0];
    if (slot) result[day] = { enabled: true, start: slot.start, end: slot.end };
  }
  return result;
}

export function normalizeWorkingHours(
  workingHours: WorkingHoursFormValues,
): WorkingHoursSlots {
  const result: WorkingHoursSlots = {};
  for (const day of WEEKDAYS) {
    const { enabled, start, end } = workingHours[day];
    if (enabled) result[day] = [{ start, end }];
  }
  return result;
}
