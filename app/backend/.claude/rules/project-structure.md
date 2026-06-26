# Project structure & conventions

## Directories: `general` vs `domains`

- `src/modules/general/` contains cross-cutting code (services, hooks, decorators,
  types) used by other modules. **No controllers.**
- `src/modules/domains/<domain>/` contains feature code: controller(s), dto(s), and
  service(s).
- Organize code by **responsibility**, not by name.
  - Shared code used by multiple domains belongs in `general`.
  - HTTP endpoints (controller + dto + feature service) belong in `domains`.
- One concept may exist in both directories if the responsibilities are different.
- Example — auth:
  - `general/auth`: `authOnly` hook, `AuthOnly` decorator, JWT verification,
    `JwtPayload`, `@fastify/jwt` augmentation.
  - `domains/auth`: login controller, dto, credential-check service.

## Module dependencies

- `general` must not depend on `domains`.
- `domains` may depend on `general`.
- Avoid direct dependencies between domain modules. Move shared code to `general`.

## File naming

- `<domain>.service.ts`
- `<domain>.dto.ts`
- `<domain>.controller.ts`

- Tests:
  `<domain>.<behavior>.test.ts`
  (e.g. `posts.access.test.ts`, `posts.create.test.ts`)

## Variants

When a domain has endpoints for multiple access levels, split it into variants.
Each variant gets its own controller, DTO, and service (only add what is needed):

```
users/
  admin/
    users.admin.controller.ts
    users.admin.dto.ts
    users.admin.service.ts
  resource/
    users.resource.controller.ts
    users.resource.dto.ts
```

| Variant    | Who                                             | Typical routes                                 |
| ---------- | ----------------------------------------------- | ---------------------------------------------- |
| `public`   | Anyone, no auth                                 | login, registration, public listings           |
| `resource` | Any authenticated user acting on their own data | `GET /me`, `PATCH /me/password`                |
| `admin`    | Admin users only                                | CRUD over other users, role changes, deletions |

Use a variant only when the domain genuinely has multiple access levels.
A domain with a single access level uses plain `<domain>.controller.ts` etc. with no variant suffix.

## Configuration

- Split config into feature files under `src/config/`.
- Name constants `[FEATURE]_[NAME]`, where `FEATURE` matches the config file name (e.g. `APP_PORT` in `app.ts`).
- Config files may read `process.env`, set default values, and validate required variables.
- **Only `src/config/*` may access `process.env`.**
- Import config constants everywhere else. Never read `process.env` directly.

## Environment files

- Never read the real `.env`. It contains real secrets.
- `.env.example` is the source of truth for environment variables.
- Keep `.env.example` up to date with placeholder values only.
- When adding a new variable:
  1. Add it to `.env.example`.
  2. Never change the real `.env`.
  3. Tell Developer to add the variable to their `.env` and set the real value.

## Type-only imports

Always use the `type` keyword when importing TypeScript types or interfaces:

```ts
import Type, { type Static } from "typebox";
```

ESM loaders resolve imports at runtime and will error if a type-only export is treated as a value. The `type` keyword tells the compiler (and the runtime) that the import is erased at emit and never needs a real binding.

## Prefer Fastify plugins

Phyzio is built on Fastify, so the Fastify plugin ecosystem is available.
Before building infrastructure features check for an existing Fastify plugin first.
Build from scratch only if no suitable plugin exists. Explain why to the Developer.
