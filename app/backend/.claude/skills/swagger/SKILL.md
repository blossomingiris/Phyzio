---
name: swagger
description: Use this skill when adding or updating OpenAPI/Swagger documentation for routes in this project
---

# Swagger / OpenAPI best practices

TypeBox schema options flow directly into the generated OpenAPI spec and Swagger UI.
Follow these rules to keep docs useful without cluttering the schemas.

---

## Route schemas — always add tags and summary

Add `tags` and `summary` to every route schema:

```ts
export const createUserSchema = {
  tags: ["Users"],
  summary: "Create a user",
  body: CreateUserBody,
  response: { 201: UserResponse },
};
```

- `tags`: groups the endpoint in Swagger UI sidebar. Use the entity name (e.g. `"Users"`, `"Clients"`).
- `summary`: one short sentence, no period.

---

## Field-level descriptions — only when non-obvious

Add `description` only when a field has a non-obvious constraint or format.
Keep descriptions short and human-readable.

**Do add:**

- Fields with `pattern` (regex) — describe the rule in plain language
- Fields where accepted values aren't clear from the name alone

**Don't add:**

- `firstName: Type.String()` — the name is self-explanatory
- Enum literals — the allowed values already appear in the OpenAPI spec
- Standard format fields like `email` or `date-time` — the format keyword documents itself

```ts
password: Type.String({
  description: "Min 8 chars with uppercase, lowercase, and digit",
  minLength: 8,
  pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$",
}),
```

---

## Enums

Never use `Type.Union([Type.Literal(...)])` for enum fields — it generates `anyOf`
and Swagger UI only renders the first option.

Use `Type.Unsafe` with a plain `enum` array instead. If the enum is defined in
Drizzle, pull values from `pgEnum.enumValues` to keep a single source of truth:

```ts
export const specialitySchema = Type.Unsafe<Speciality>({
  type: "string",
  enum: specialityEnum.enumValues,
});
```

---

## What not to add

- `title` — do not set on schema parts. TypeBox uses it as the OpenAPI component
  name; setting it on inline schemas causes duplicate/conflicting component names.
- `description` on response schemas — not rendered by Swagger UI in a useful way.
