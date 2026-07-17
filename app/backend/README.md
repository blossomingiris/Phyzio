# Phyzio Backend

REST API for a physical therapy clinic admin panel.

Stack: Fastify 5, TypeScript (ESM), PostgreSQL, Drizzle ORM, TypeBox.

## Setup

```bash
npm install
cp .env.example .env   # fill in real values
npm run docker         # starts Postgres + CloudBeaver via docker-compose
npm run db:migrate
npm run db:seed        # optional sample data
npm run server
```

## Scripts

| Script            | Purpose                                |
| ----------------- | --------------------------------------- |
| `npm run server`   | Start the API with watch mode          |
| `npm test`         | Run the test suite (vitest)            |
| `npm run db:generate` | Generate a migration from `database/schemas.ts` |
| `npm run db:migrate`  | Apply pending migrations             |
| `npm run db:seed`     | Seed sample data                     |

## API docs

Swagger UI is served at `http://localhost:{PORT}/docs` once the server is running — it's the source of truth for the API contract (TypeBox schemas drive types, validation, and docs from a single definition).

## Project structure

See `CLAUDE.md` and `.claude/rules/project-structure.md` for directory layout and conventions (`modules/domains/<domain>/`, `modules/general/`, plugin/config layout, etc.).
