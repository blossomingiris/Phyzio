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
await this.db.insert(users).values({ ...data, email: data.email.toLowerCase() });

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

Define a `findOrFail` method on every service that fetches a single entity by id.
It wraps the internal `one` lookup and throws `NotFoundError` when the row is absent,
so controllers never have to handle the null case themselves.

```ts
// service
async findOrFail(id: number) {
  const user = await this.one({ id });
  if (!user) throw new NotFoundError("User not found");
  return user;
}
```

Use `findOrFail` in controllers whenever the route must 404 if the resource does
not exist — which is the case for every GET-by-id, PATCH, and DELETE route.

```ts
// controller
const user = await this.usersService.findOrFail(params.id);
```

Never call `one` from a controller — the null-check would have to be repeated in every route that fetches a single entity. `findOrFail` owns that check once so controllers always receive a guaranteed non-null value.
