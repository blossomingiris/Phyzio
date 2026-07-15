import { isApiFieldError } from "@/shared/api/errors";
import type { UseFormReturnType } from "@mantine/form";

/**
 * Maps a field-level API error onto a Mantine form's error state.
 *
 * @returns `true` if the error was a field error and applied to the form;
 * `false` otherwise, so the caller can fall back to a generic alert.
 */
export function applyApiFieldErrors<Values>(
  form: UseFormReturnType<Values>,
  error: unknown,
): boolean {
  if (!isApiFieldError(error)) return false;

  form.setErrors(
    Object.fromEntries(error.errors.map((e) => [e.field, e.message])),
  );
  return true;
}
