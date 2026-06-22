# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Physical Therapy Clinic Admin Panel — backend REST API (frontend planned for a future phase).  
Stack: Fastify 5, TypeScript, PostgreSQL, Drizzle ORM.

This is an MVP targeting minimum viable functionality — avoid complexity and over-abstraction across all layers. Future phases will introduce a service layer, repository layer, controllers, global error handler, and dedicated middleware as the codebase grows.

## Documentation-first approach

The primary design constraint is that every endpoint must be fully documented before or alongside implementation. TypeBox schemas drive this: a single schema definition simultaneously enforces TypeScript types, validates incoming requests at runtime, and generates the OpenAPI spec. Swagger UI at `/docs` is the source of truth for the API contract. When adding a route, define the TypeBox schema first, then the handler.

## Commands

```bash
npm run server       # start dev server with --watch (hot reload)
npm run docker       # start PostgreSQL + CloudBeaver UI (http://localhost:8978)
npm run db:generate  # generate Drizzle migration files from schema changes
npm run db:migrate   # apply pending migrations to the database
```

No test runner is configured yet (`npm test` exits with an error).

Lint: ESLint is installed but has no config file — add `.eslintrc` before running it.

## Architecture

**Runtime**: ESM-only (`"type": "module"`). All imports must use `.js` extensions even for `.ts` source files (NodeNext resolution). Path alias `#app/*` maps to `./app/*`.

**Request lifecycle**: `index.ts` → Fastify with TypeBox type provider → plugins → route handlers. All request/response schemas use TypeBox (`@fastify/type-provider-typebox`), which gives compile-time and runtime validation in one.

**Plugin-first**: Fastify plugins live in `app/plugins/`. Each plugin decorates the `fastify` instance (e.g., `drizzle.ts` adds `fastify.db`). The DB plugin uses `Symbol.for("skip-override")` to prevent double-registration. The drizzle plugin is defined but **not yet registered** in `index.ts`.

**Database layer**:
- `app/database/drizzle-client.ts` — creates the `pg` connection pool and Drizzle instance; exported as `DrizzleClient` type.
- `app/database/schemas.ts` — currently empty; all table definitions go here.
- `drizzle/` — auto-generated migration files (do not edit manually).
- After adding tables to `schemas.ts`, run `db:generate` then `db:migrate`.

**API docs**: Swagger UI is auto-generated at `http://localhost:{PORT}/docs`. Routes must include TypeBox schemas in their route options to appear in the docs.

**DTOs**: Shared TypeBox schema fragments live in `app/dto/`. Import from there to avoid duplicating schema definitions across routes.

**Config**: `app/config/app.ts` and `app/config/db.ts` read from `.env`. Required vars: `PORT`, `DOMAIN`, `PROTOCOL`, `DATABASE_URL`.

## Future layers (not yet implemented)

Service layer · Repository layer · Controllers · Global error handler · Validation/serialization middleware
