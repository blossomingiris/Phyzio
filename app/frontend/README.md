# Phyzio — Frontend

React + TypeScript SPA for Phyzio, built with Vite and Mantine.

## Quick start

```bash
npm install
npm run dev
```

The API client is generated from the backend's OpenAPI schema, so the backend
(`app/backend`) must be running locally before you regenerate it:

```bash
npm run openapi:generate
```

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Typecheck and build for production |
| `npm run check` | Typecheck + lint (the combined gate) |
| `npm run lint` | Lint only |
| `npm run openapi:generate` | Regenerate the API client from the backend's OpenAPI schema |

See [.claude/rules/architecture.md](./.claude/rules/architecture.md) for how the codebase is structured.
