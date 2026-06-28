import Type, { type Static, type TSchema, type TSchemaOptions } from "typebox";

/**
 * TypeBox wrapper for AJV discriminated unions (`oneOf` + `discriminator`).
 *
 * Prefer this over `Type.Union` when branches have different required fields
 * depending on a single literal property — AJV picks the branch by that literal
 * instead of evaluating all of them. Requires `{ discriminator: true }` in AJV
 * custom options.
 *
 * @param propertyName - Literal property that identifies the branch (must be
 *                       `Type.Literal` in every branch).
 * @param branches     - `Type.Object` schema per variant.
 * @param options      - Optional TypeBox schema options.
 * @returns `Type.Unsafe` typed as the union of all branch static types.
 *
 * @example
 * discriminatedUnion('status', [
 *   Type.Object({ status: Type.Literal('cancelled'), reason: reasonSchema }, { additionalProperties: false }),
 *   Type.Object({ status: Type.Literal('confirmed') },                        { additionalProperties: false }),
 * ]);
 */
export function discriminatedUnion<const T extends TSchema[]>(
  propertyName: string,
  branches: T,
  options?: TSchemaOptions,
) {
  type Result = {
    [K in keyof T]: T[K] extends TSchema ? Static<T[K]> : never;
  }[number];
  return Type.Unsafe<Result>({
    ...options,
    type: "object",
    discriminator: { propertyName },
    oneOf: branches,
  });
}
