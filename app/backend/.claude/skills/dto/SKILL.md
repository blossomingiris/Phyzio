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

## 7. Discriminated unions

Use `discriminatedUnion` (from `#app/modules/general/dto/typebox.ts`) when a body has
distinct shapes identified by a literal property — each shape has its own required or
forbidden fields. This lets AJV enforce the constraint declaratively instead of leaving
it to manual service-layer checks.

**Use a flat optional object** when fields are independent and any combination is valid.  
**Use a discriminated union** when the body is polymorphic: different shapes for different
values of a single literal discriminator (post type, decision kind, status transition, etc.).

```ts
// post type with shape-specific required fields
const textPostSchema   = Type.Object({ type: Type.Literal("text"),  content: Type.String() },       { additionalProperties: false });
const imagePostSchema  = Type.Object({ type: Type.Literal("image"), url: Type.String({ format: "uri" }) }, { additionalProperties: false });

export const createPostBody = discriminatedUnion("type", [textPostSchema, imagePostSchema]);
export type CreatePostBody  = Static<typeof createPostBody>;
```

**Rules:**
- Every branch must be `Type.Object` with `{ additionalProperties: false }`
- The discriminator property must be `Type.Literal` in every branch — AJV requires a `const` value per branch, not an enum
- Export `Static<typeof schema>` from the DTO file that owns the body; TypeScript derives the full union automatically
- If a branch is shared across DTOs, define it in `*.shared.dto.ts` as a schema only — never export its `Static<>` type from shared; the type belongs in the DTO that uses it as a request body

**Endpoint design:** a discriminated union on the body and a dedicated endpoint are
independent decisions. Use a dedicated endpoint (e.g. `PATCH /:id/status`) when the
operation is a domain event — a state-machine transition, an irreversible action — not
just a data edit. The body of that endpoint may or may not be a discriminated union.
Conversely, a general update endpoint can use a discriminated union if the body is
inherently polymorphic, regardless of whether it touches status.

---

## 8. Antipatterns

### Use Pick, never Omit

- Always use `Type.Pick` when deriving schemas
- Never use `Type.Omit`

### Me routes — do not echo the caller back in responses

Resource (`/me/*`) routes are scoped to the authenticated user. Do not include
that user's own profile in the response — the caller already knows who they are.

Example: `GET /me/appointments` omits the `therapist` field because the
authenticated therapist is always the owner of those appointments.
