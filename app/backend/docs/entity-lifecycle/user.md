# User Entity Lifecycle

## Overview

A User represents a staff member of the clinic. Users are created by admins only —
there is no self-registration. Users are never hard-deleted through the API.

## Role

Every user has exactly one role, set at creation and changeable later by an admin:

| Role | Description |
|---|---|
| `admin` | Clinic manager — full admin access, no clinical profile |
| `therapist` | Practitioner — has an additional `Therapist` entity attached |

The role is a type discriminator, not a separate entity. An admin is just a User
with `role = 'admin'`. A therapist is a User with `role = 'therapist'` **plus** a
linked `Therapist` record — see [therapist.md](therapist.md).

## Endpoints

### Admin (`/users`, admin only)

| Method | Path | Description |
|---|---|---|
| `GET` | `/users` | List all users (paginated, filterable by role) |
| `GET` | `/users/:id` | Get a user by ID |
| `POST` | `/users` | Create a user |
| `PATCH` | `/users/:id` | Update name or email |
| `PATCH` | `/users/:id/role` | Change the user's role |

### Resource (`/me`, any authenticated user)

| Method | Path | Description |
|---|---|---|
| `GET` | `/me` | Get own profile |
| `PATCH` | `/me` | Update own name or email |
| `PATCH` | `/me/password` | Change own password |

There are no public (unauthenticated) user endpoints.

## Permissions

| Action | Who can do it |
|---|---|
| Create a user | Admin only |
| Read any user | Admin only |
| Update any user's name / email | Admin only |
| Change any user's role | Admin only |
| Read own profile | Any authenticated user |
| Update own name / email | Any authenticated user |
| Change own password | Any authenticated user |

## Errors

| HTTP Error | When it occurs |
|---|---|
| 404 Not Found | User ID does not exist |
| 409 Conflict | Email is already in use by another user |
| 422 Unprocessable Entity | Request body fails validation (e.g. missing required fields, password too weak) |

## Creating a user

`POST /users` creates a bare user row. The role must be supplied explicitly.

- Use this path for **admins**.
- For **therapists**, use `POST /therapists` instead — it creates the User
  and the Therapist record atomically in one request. See [therapist.md](therapist.md).

Email must be unique across all users. A duplicate returns 409 Conflict.

Password rules: minimum 8 characters, must contain at least one uppercase letter,
one lowercase letter, and one digit. The password is **never returned** in any
response.

## Updating a user

`PATCH /users/:id` updates `firstName`, `lastName`, and `email` — all optional,
send only the fields you want to change.

Role is updated through its own endpoint (`PATCH /users/:id/role`) on purpose:
changing a role is a more consequential action and is kept as a distinct operation
for clarity and future auditability.

## No delete

There is no delete endpoint for User. Users are permanent records. If a therapist
needs to be removed from active duty, that is handled through the Therapist entity
(soft delete + `isActive`), not by removing the User. See [therapist.md](therapist.md).

## Data Model

See [`database/schema.md`](../database/schema.md) → `users` table.
