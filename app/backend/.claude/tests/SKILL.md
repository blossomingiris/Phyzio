## name: tests

## description: Use this skill when writing, reviewing, or fixing tests — covers test strategy, app lifecycle, data isolation, helpers, and common gotchas

# Testing

## 1. Framework and configuration

- **Vitest** (`vitest run`), pool `forks` + `singleFork: true` — all spec files run sequentially in a single worker, sharing one DB connection
- Files: `test/**/*.spec.ts`; helpers in `test/helpers/`
- `vitest.config.ts` merges `.env` + `.env.test` via `test.env` so worker forks get the right env:
  ```ts
  const env = {
    ...parse(readFileSync(resolve(root, ".env"), "utf-8")),
    ...parse(readFileSync(resolve(root, ".env.test"), "utf-8")),
  };
  export default defineConfig({ test: { env, ... } });
  ```
- `.env.test` contains exactly 4 overrides: `NODE_ENV=test`, `DATABASE_NAME=phyzio_test`, `DATABASE_URL=...phyzio_test`, `BCRYPT_ROUNDS=1`
- `phyzio_test` is a separate Postgres DB in the same Docker container (`docker exec phyzio_postgres createdb -U USER phyzio_test`)
- `createTestApp()` calls `migrate()` on boot — the test DB always stays in sync with migrations automatically

## 2. Prefer e2e over unit tests

Drive the full stack through `app.inject` against the real test DB (real migrations applied). This catches wiring bugs that unit tests miss — controller → service → DB all exercised in one shot.

Unit tests are acceptable only for complex, isolated shared logic (e.g. a non-trivial utility or validator). Don't unit-test controllers or services in isolation.

## 3. One `createTestApp()` per file

Each test file creates the app once in `beforeAll`, closes it in `afterAll`.

Never create two app instances in the same file. Some plugins mutate module-level schema objects on first compile — a second boot in the same module cache will see a corrupted schema.

```ts
let h: TestApp;

beforeAll(async () => {
  h = await createTestApp();
  await h.clearAll();      // reset DB state for this file
  await h.makeAdmin();     // bootstrap the admin user
  ({ token: adminToken } = await h.login(ADMIN_EMAIL));
});
afterAll(async () => {
  await h.close();
});
```

## 4. `createTestApp()` helpers

`createTestApp()` returns an object with:

| Helper | Purpose |
|---|---|
| `inject` | `app.inject.bind(app)` — fire HTTP requests |
| `db` | raw Drizzle client for assertions when the API doesn't expose a field |
| `clearAll()` | `TRUNCATE users, clients, treatments RESTART IDENTITY CASCADE` |
| `makeAdmin(overrides?)` | direct DB insert of an admin user (only bootstrap use case for direct DB writes) |
| `login(email, password?)` | POST /auth/login → returns `{ token, cookie }` |
| `close()` | `app.close()` |

Constants: `ADMIN_EMAIL = "admin@test.com"`, `ADMIN_PASSWORD = "Test1234!"`

## 5. Data isolation

- Call `clearAll()` in `beforeAll` — wipes tables and resets sequences
- Create all test data through the API (`app.inject`), not direct DB inserts
  - Exception: `makeAdmin()` uses a direct insert because there is no public registration endpoint
- Check setup responses explicitly so failures surface early:
  ```ts
  if (res.statusCode !== 201) throw new Error(`setup failed: ${res.body}`);
  ```

## 6. Avoid appointment time-slot conflicts

The API rejects overlapping appointments for the same therapist. Use a counter-based helper so every `createAppointment()` call gets its own non-overlapping window:

```ts
let slotIndex = 0;
function nextSlot() {
  const base = new Date("2026-08-01T08:00:00Z");
  base.setHours(base.getHours() + slotIndex++);
  const end = new Date(base);
  end.setHours(end.getHours() + 1);
  return { startedAt: base.toISOString(), endedAt: end.toISOString() };
}
```

Always spread `...nextSlot()` into appointment payloads, never hardcode a fixed timestamp.

## 7. Status machine constraints

Check the service files for valid transitions. One non-obvious rule: **a treatment plan's `open → in_progress` transition is automatic, not manual** — it triggers when the first linked appointment is marked `completed`. To test any `in_progress` behaviour, create an appointment with `treatmentPlanId`, walk it through its states to `completed`, and the plan advances automatically.

## 8. Soft delete

Therapists and clients are soft-deleted (`DELETE` stamps `deletedAt`). Reads exclude deleted rows **by default**; admin opts in with `?deleted=true` on list and find-by-id. When testing a delete, assert both sides: `404` / absent from the list by default, and present (with `deletedAt` populated) when `deleted=true`.

## 9. Write tests that have real value

Most valuable test categories:

- **Lifecycle** — create → read → update → delete, cascade deletes, unique constraints
- **Access control** — owner vs other user vs guest vs admin; auth bugs are dangerous and invisible to manual testing
- **Business rules** — status machines, auto-transitions, computed fields (`totalAmount = pricePerUnit * quantity`)

Don't test:

- Trivial CRUD with no business logic
- Rules already enforced statically by TypeBox/AJV schema
- Service internals already covered end-to-end by an `app.inject` test

If a requested test looks like coverage for its own sake, say so. Ask what real scenario it protects against and agree before writing.

## 10. Keep test output clean

Pass `logger: false` when creating the test app so Fastify request logs don't pollute output.
