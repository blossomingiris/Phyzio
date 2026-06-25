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

- **Schema part**: reusable fragment used inside route schemas

- Build route schemas from schema parts only

---

## 3. Request types

- Export `ValidatedRequest` only for route schemas
- Never create types for schema parts
- Never create types for response-only schemas

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

## 5. Reuse schemas

- Reuse `entityIdParamsSchema` for all ID routes
- Reuse `entityResponseSchema` for single and list:
  - single: `entityResponseSchema`
  - list: `Type.Array(entityResponseSchema)`
- Use `Type.Partial(createEntitySchema.body)` for updates

---

### Use Pick, never Omit

- Always use `Type.Pick` when deriving schemas
- Never use `Type.Omit`

---

## 6. PII in responses

- Response DTO defines public API output
- Never expose PII without Developer approval
- Ask Developer before adding fields like email, phone, address

---

## 7. Response shape

- Always return objects
- Never return primitives

Examples:

- OK: `{ success: true }`
- Wrong: `true`
