---
description: Regenerate the OpenAPI schema from the backend and typecheck the app against it
argument-hint: [feature/area to focus the report on]
---

Sync the frontend with the current backend contract. With **openapi-react-query** the generated
schema *is* the client — features call `rqClient` / `fetchClient` (from `src/shared/api/instance.ts`)
with path + method literals typed against `paths`, so there are no hand-written per-endpoint
modules to edit. Drift surfaces as type errors at the call sites.

Arguments, if any: $ARGUMENTS

1. Run `npm run openapi:generate`. It fetches the spec from the backend and rewrites
   `src/shared/api/generated/{openapi.json,schema.d.ts}`. If the backend is unreachable the
   script exits non-zero with a clear message — stop and show it. (Backend lives in `app/backend`,
   started with `npm run server`; override its origin with `API_URL`.)

2. Check the **hand-written** type surface in `src/shared/api/schema.ts` against the fresh spec.
   The backend inlines its DTOs (`components.schemas` is empty), so `ApiError` and any other shared
   types there are maintained by hand — update them if the error/response shape changed. If the
   backend has started exposing named `components.schemas`, prefer those over the hand aliases.

3. Run `npm run check`. Every `rqClient` / `fetchClient` call is typed against the generated
   `paths`, so a removed/renamed path, a changed success status, or changed params/body shows up
   here as a type error at the call site.

4. Report:
   - if `check` passed: the single line "in sync — no drift";
   - if it failed: the broken call sites (file + endpoint + what changed), grouped by feature.
     These live in feature/component code — don't mass-edit them, list them so the owner decides.
     If `$ARGUMENTS` names a feature/area, focus the report there.
   Also note any change you made to `src/shared/api/schema.ts` in step 2.
