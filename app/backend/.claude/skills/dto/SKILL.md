---
name: dto
description: Use this skill when you create or update a request or response DTO in this project
---

# DTO best practices

DTO = TypeBox schema used in Fastify route handlers.
This file defines rules for how we design DTOs in this project.

---

## 1. DTO files

- Put all DTOs in `[name].dto.ts`
- Never define schemas inside controllers
- Use one DTO file per entity by default
- Split files only if the entity is complex

---

## 2. Route schemas and schema parts

- **Route schema**: full schema used in `schema(...)`
  `{ body, params, querystring, response }`

- **Schema part**: reusable fragment used inside route schemas.
  - Used by **multiple domains** → `domains/shared/dto/index.ts` (e.g. `paramId`, `paginationQueryParams`, `paginationMeta`)
  - Build route schemas from schema parts only

---

## 3. Type exports

### From DTO schemas — use value/type duality

Export `Static<typeof Schema>` using the **same name** as the schema constant.
TypeScript allows a `const` and a `type` to share a name; importers get both from one import.

```ts
export const userResponce= Type.Object({ ... });
export type  UserResponce = Static<typeof userResponce>;
```

Export types for: body schemas, querystring schemas, params schemas.
Never export types for response-only schemas — those are never used outside the DTO.

### Keep implementation types out of DTOs

**Rule:** a type belongs in the DTO only if it directly represents an HTTP request or response shape.
Everything that exists to serve the implementation layer stays in that layer.

Common cases where the type lives **in the service**, not the DTO:

**Filter/query options** — internal parameters for `buildWhere` or query methods:

---

## 4. additionalProperties

### Request DTO

- Always use `{ additionalProperties: false }`
- Reject unknown fields
- Never use `true`

### Response DTO

- Do not set `additionalProperties`
- Serializer already strips unknown fields
- Never use `true`

---

### Use Pick, never Omit

- Always use `Type.Pick` when deriving schemas
- Never use `Type.Omit`

---

## 5. PII in responses

- Response DTO defines public API output
- Never expose PII without Developer approval
- Ask Developer before adding fields like email, phone, address

---

## 6. Response shape

- Always return objects
- Never return primitives

Examples:

- OK: `{ success: true }`
- Wrong: `true`

---

## 7. Swagger / OpenAPI docs

TypeBox schema options flow directly into the generated OpenAPI spec and Swagger UI.
Follow these rules to keep docs useful without cluttering the schemas.

### Route schemas — always add

Add `tags` and `summary` to every route schema:

```ts
export const adminCreateUserSchema = {
  tags: ["Users"],
  summary: "Create a user",
  body: AdminCreateUserBody,
  response: { 201: UserResponse },
};
```

- `tags`: groups the endpoint in Swagger UI sidebar. Use the entity name (e.g. `"Users"`, `"Clients"`).
- `summary`: one short sentence, no period. Describes what the endpoint does.

### Field-level — only when non-obvious

Add `description` and/or `example` only when a field has a non-obvious constraint or format.

**Do add:**

- Fields with `pattern` (regex) — describe the rule in plain language
- Fields where accepted values aren't clear from the name alone

**Don't add:**

- `firstName: Type.String()` — the name is self-explanatory
- Enum literals — the allowed values already appear in the OpenAPI spec
- Standard format fields like `email` or `date-time` — the format keyword documents itself

### Example

```ts
password: Type.String({
  description: "Min 8 chars with uppercase, lowercase, and digit",
  example: "Secret123",
  minLength: 8,
  pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$",
}),
```

### What not to add

- `title` — do not set on schema parts. TypeBox uses it as the OpenAPI component name; setting it on inline schemas causes duplicate/conflicting component names.
- `description` on response schemas — not rendered by Swagger UI in a useful way.
