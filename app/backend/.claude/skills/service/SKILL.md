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
