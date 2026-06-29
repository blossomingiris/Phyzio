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
export const userResponse = Type.Object({ ... });
export type  UserResponse = Static<typeof userResponse>;
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

## 7. Antipatterns

### Use Pick, never Omit

- Always use `Type.Pick` when deriving schemas
- Never use `Type.Omit`

### Me routes — do not echo the caller back in responses

Resource (`/me/*`) routes are scoped to the authenticated user. Do not include
that user's own profile in the response — the caller already knows who they are.

Example: `GET /me/appointments` omits the `therapist` field because the
authenticated therapist is always the owner of those appointments.
