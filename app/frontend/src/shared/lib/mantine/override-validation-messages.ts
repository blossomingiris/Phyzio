import type { StandardSchemaV1 } from "@standard-schema/spec";
import { schemaResolver } from "@mantine/form";

/**
 * Builds a Mantine `validate` function that replaces specific fields'
 * validation messages, without redeclaring those fields' rules.
 *
 * @param schema - Schema to validate against, typically a generated one from
 * `shared/api/generated/validation-schemas.ts`.
 * @param overrides - Replacement message per field name; fields not listed
 * keep the schema's own message.
 * @returns An async Mantine `validate` function suitable for `useForm`.
 */
export function overrideValidationMessages<
  Values extends Record<string, unknown>,
>(
  schema: StandardSchemaV1<Values>,
  overrides: Partial<Record<keyof Values, string>>,
) {
  return async (values: Values) => {
    const errors = await schemaResolver(schema)(values);
    for (const field of Object.keys(overrides)) {
      if (field in errors) {
        errors[field] = overrides[field as keyof Values];
      }
    }
    return errors;
  };
}
