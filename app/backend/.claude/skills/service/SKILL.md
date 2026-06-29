---
name: service
description: Use this skill when you create or update a service in this project
---

# Service best practices

A service encapsulates all business logic and database access for a domain.
This file defines rules for how we design services in this project.

---

## 1. Data normalisation on write

Normalise input data in the service before any insert or update — never in the
controller or DTO.

### Email — always lowercase

Lowercase every email before writing to the database so the `UNIQUE` constraint
on `users.email` and `clients.email` catches duplicates regardless of the casing
the caller sends (`A@x.com` and `a@x.com` must collide).

```ts
// create
await this.db
  .insert(users)
  .values({ ...data, email: data.email.toLowerCase() });

// update — only normalise when the field is present
const normalized =
  data.email !== undefined
    ? { ...data, email: data.email.toLowerCase() }
    : data;
await this.db.update(users).set({ ...normalized, updatedAt: new Date() });
```

Apply this pattern to every service that writes `email` to the database.

---

## 2. findOrFail

Every service exposes `findOrFail(id, filters?)`. It wraps `one` and throws `NotFoundError`
when absent. The optional `filters` (e.g. `{ therapistId }`) scope the lookup so it 404s
if the record belongs to a different owner.

Controllers call it before every mutating operation — establishing existence and ownership
is the controller's job, not the service method's:

```ts
// resource controller
await service.findOrFail(req.params.id, { therapistId });
return service.update(req.params.id, req.body);

// admin controller
await service.findOrFail(req.params.id);
return service.update(req.params.id, req.body);
```

Mutating service methods never call `findOrFail` internally. If a method needs current
entity state for a business rule (e.g. status transition), use a private focused query:

```ts
private async getStatusOrFail(id: number): Promise<EntityStatus> {
  const [row] = await this.db.select({ status: table.status }).from(table).where(eq(table.id, id));
  if (!row) throw new NotFoundError("Entity not found");
  return row.status;
}
```

---

## 3. Database errors

Catch Postgres error codes in the service and re-throw as domain errors. The correct
error type depends on the operation:

| Code    | On INSERT/UPDATE                          | On DELETE                              |
| ------- | ----------------------------------------- | -------------------------------------- |
| `23503` | FK target missing → `NotFoundError`       | Row referenced elsewhere → `ConflictError` |
| `23505` | Unique violation → `ConflictError`        | —                                      |

Always re-throw unrecognised errors so unexpected failures surface.
