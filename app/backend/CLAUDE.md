# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Physical Therapy Clinic Admin Panel — backend REST API (frontend planned for a future phase).  
Stack: Fastify 5, TypeScript, PostgreSQL, Drizzle ORM.

## Documentation-first approach

Every endpoint must be fully documented before or alongside implementation. TypeBox schemas drive this: a single schema definition simultaneously enforces TypeScript types, validates incoming requests at runtime, and generates the OpenAPI spec. Swagger UI at `/docs` is the source of truth for the API contract. When adding a route, define the TypeBox schema first, then the handler.

## Architecture

**Runtime**: ESM-only (`"type": "module"`). All imports must use `.js` extensions even for `.ts` source files (NodeNext resolution). Path alias `#app/*` maps to `./`.

**Request lifecycle**: `index.ts` → Fastify with TypeBox type provider → plugins → route handlers.

**Directory layout** (project root = `app/backend/`):

- `modules/` — feature code; see `.claude/rules/project-structure.md` for conventions
  - `modules/domains/<domain>/` — controllers, services, DTOs per domain
  - `modules/general/` — cross-cutting code (shared DTOs, hooks, decorators)
- `plugins/` — Fastify plugins: `database.plugin.ts`, `routes.plugin.ts`, `swagger.plugin.ts`
- `config/` — `app.ts`, `db.ts`; only config files may read `process.env`
- `database/` — `drizzle-client.ts`, `schemas.ts` (all table definitions), `types.ts`
- `errors/` — `httpErrors.ts`, `registerGlobalErrorHandler.ts`
- `drizzle/` — auto-generated migration files (do not edit manually)

**Database**: After editing `database/schemas.ts`, run `db:generate` then `db:migrate`.

**Validation strategy (MVP)**: The API layer (TypeBox schemas) is the single trusted validation layer. No `check()` constraints are defined in the database schema. If this project graduates beyond MVP, add DB-level constraints as a second line of defence.

**API docs**: Swagger UI at `http://localhost:{PORT}/docs`. For a route to appear in the docs, it must include TypeBox schemas in its route options AND the controller must be registered in `plugins/routes.plugin.ts`.

## Environment files

- Never read the real `.env`. It contains real secrets.
- `.env.example` is the source of truth for environment variables.
- Keep `.env.example` up to date with placeholder values only — never real domains,
  ports, credentials, or secrets. Use `your_<variable_name>` as the placeholder
  value for every entry (e.g. `DATABASE_PORT=your_db_port`).
- When adding a new variable:
  1. Add it to `.env.example`.
  2. Never change the real `.env`.
  3. Tell Developer to add the variable to their `.env` and set the real value.
