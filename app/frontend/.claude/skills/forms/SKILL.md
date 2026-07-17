---
name: forms
description: Use this skill when creating or updating a `*-form-values.ts` module (form state shape, empty defaults, submit normalization, validation) in this project
---

# Form values conventions

A feature's form module (e.g. `client-form-values.ts`, `treatment-form-values.ts`)
follows one recurring shape:

- A `*FormValues` type — what Mantine's form state actually holds while editing.
- An `EMPTY_*_FORM_VALUES` constant — the blank/default state for a create form.
- A `*ToFormValues(entity)` mapper — API entity → form values, for edit forms.
- A `normalize*FormValues(values)` function — form values → API payload shape.
- A `validate*Form(schema)` factory — wraps Zod validation with friendlier
  per-field messages (see `override-validation-messages.ts`).

---

## Why normalization exists

While editing, optional fields sit at `""` or `null` — Mantine's controlled
inputs need a concrete value, not `undefined`. But the API's Zod schemas treat
blank as "provide a valid value," not "omit this field" (e.g. `phone` is
`min(1).optional()`). Submitting `""` fails validation even though the field
is genuinely optional.

`normalize*FormValues` bridges this: it converts blanks to `undefined` (dropped
from the request) right before both submission and client-side validation, so
the two agree on what's acceptable. See `client-form-values.ts` for the
reference implementation.

## Variations to watch for

- **Create vs. update can normalize differently.** A field that means "omit"
  when blank on create (`undefined`) may need to mean "clear it" on update
  (`null`) — see `normalizeTreatmentUpdateValues` layering on top of
  `normalizeTreatmentFormValues`.
- **`.strict()` schemas reject extra keys.** Don't include a field the target
  schema doesn't declare (e.g. `isActive` must be left out of the treatment
  *create* payload since `postTreatments` is `.strict()` without it).
- **A `!` non-null assertion on a form field is only safe post-validation.**
  If a field is nullable during editing but required by the schema, Mantine's
  `validate` must already guarantee it by the time normalization runs on
  submit — don't add the assertion without that guarantee in place.
