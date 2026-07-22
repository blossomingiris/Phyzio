import type { Therapist } from "@/shared/domain/therapist";
import { overrideValidationMessages } from "@/shared/lib/mantine/override-validation-messages";
import {
  emptyWorkingHours,
  normalizeWorkingHours,
  workingHoursToFormValues,
  type Weekday,
  type WorkingHoursFormValues,
} from "@/services/working-hours";
import type { StandardSchemaV1 } from "@standard-schema/spec";

export type TherapistFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  speciality: Therapist["speciality"];
  phone: string;
  workingHours: WorkingHoursFormValues;
  isActive: boolean;
};

const CREATE_DEFAULT_WEEKDAYS: Weekday[] = ["mon", "tue", "wed", "thu", "fri"];

function defaultCreateWorkingHours(): WorkingHoursFormValues {
  const workingHours = emptyWorkingHours();
  for (const day of CREATE_DEFAULT_WEEKDAYS) {
    workingHours[day] = { enabled: true, start: "09:00", end: "17:00" };
  }
  return workingHours;
}

export const EMPTY_THERAPIST_FORM_VALUES: TherapistFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  speciality: "orthopedic",
  phone: "",
  workingHours: defaultCreateWorkingHours(),
  isActive: true,
};

export function therapistToFormValues(
  therapist: Therapist,
): TherapistFormValues {
  return {
    firstName: therapist.firstName,
    lastName: therapist.lastName,
    email: therapist.email,
    password: "",
    speciality: therapist.speciality,
    phone: therapist.phone,
    workingHours: workingHoursToFormValues(therapist.workingHours),
    isActive: therapist.isActive,
  };
}

export function normalizeCreateTherapistFormValues(
  values: TherapistFormValues,
) {
  return {
    firstName: values.firstName,
    lastName: values.lastName,
    email: values.email,
    password: values.password,
    speciality: values.speciality,
    phone: values.phone,
    workingHours: normalizeWorkingHours(values.workingHours),
  };
}

export function normalizeUpdateTherapistFormValues(
  values: TherapistFormValues,
) {
  return {
    speciality: values.speciality,
    phone: values.phone,
    isActive: values.isActive,
  };
}

export function normalizeTherapistNameFormValues(values: TherapistFormValues) {
  return {
    firstName: values.firstName,
    lastName: values.lastName,
  };
}

const THERAPIST_FIELD_MESSAGES = {
  firstName: "First name must be 1–255 characters",
  lastName: "Last name must be 1–255 characters",
  email: "Enter a valid email address",
  password:
    "Password must be at least 8 characters with an uppercase letter, a lowercase letter, and a digit",
  phone: "Phone number must be 1–50 characters",
};

export function validateCreateTherapistForm<
  Values extends Record<string, unknown>,
>(schema: StandardSchemaV1<Values>) {
  const validate = overrideValidationMessages(
    schema,
    THERAPIST_FIELD_MESSAGES as Partial<Record<keyof Values, string>>,
  );
  return (values: TherapistFormValues) =>
    validate(normalizeCreateTherapistFormValues(values) as unknown as Values);
}

export function validateUpdateTherapistForm<
  FieldsValues extends Record<string, unknown>,
  NameValues extends Record<string, unknown>,
>(
  fieldsSchema: StandardSchemaV1<FieldsValues>,
  nameSchema: StandardSchemaV1<NameValues>,
) {
  const validateFields = overrideValidationMessages(
    fieldsSchema,
    THERAPIST_FIELD_MESSAGES as Partial<Record<keyof FieldsValues, string>>,
  );
  const validateName = overrideValidationMessages(
    nameSchema,
    THERAPIST_FIELD_MESSAGES as Partial<Record<keyof NameValues, string>>,
  );
  return async (values: TherapistFormValues) => {
    const [fieldErrors, nameErrors] = await Promise.all([
      validateFields(
        normalizeUpdateTherapistFormValues(values) as unknown as FieldsValues,
      ),
      validateName(
        normalizeTherapistNameFormValues(values) as unknown as NameValues,
      ),
    ]);
    return { ...fieldErrors, ...nameErrors };
  };
}
