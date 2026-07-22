import type { User } from "@/shared/domain/user";
import {
  emptyWorkingHours,
  normalizeWorkingHours,
  workingHoursToFormValues,
  type WorkingHoursFormValues,
} from "@/services/working-hours";

export type WorkingHoursTabFormValues = {
  workingHours: WorkingHoursFormValues;
};

export function userToWorkingHoursFormValues(
  user: User,
): WorkingHoursTabFormValues {
  return {
    workingHours: user.therapist
      ? workingHoursToFormValues(user.therapist.workingHours)
      : emptyWorkingHours(),
  };
}

export function normalizeWorkingHoursTabFormValues(
  values: WorkingHoursTabFormValues,
) {
  return {
    workingHours: normalizeWorkingHours(values.workingHours),
  };
}
