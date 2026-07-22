# User Entity Lifecycle

## Overview

A User represents a staff member of the clinic. Users are created by admins only —
there is no self-registration.

## Role

Every user has exactly one role, set at creation and changeable later by an admin:

| Role | Description |
|---|---|
| `admin` | Clinic manager — full admin access, no clinical profile |
| `therapist` | Practitioner — has an additional `Therapist` entity attached |

The role is a type discriminator, not a separate entity. An admin is just a User
with `role = 'admin'`. A therapist is a User with `role = 'therapist'` **plus** a
linked `Therapist` record — see [therapist.md](therapist.md).

## Soft Delete

`DELETE /users/:id` marks the user as deleted. Unlike Therapist's `isActive` flag,
a deleted User is fully locked out:

- `POST /auth/login` rejects their credentials (same 401 as a wrong password —
  no information is leaked about whether the account exists).
- `POST /auth/refresh` rejects their refresh token, so an already-issued refresh
  token cannot mint a new access token after deletion. An already-issued access
  token remains valid until it naturally expires — there is no per-request DB
  check to revoke it early.
- `GET /me` and other resource endpoints 404 for the deleted user's own ID, same
  as any other soft-deleted lookup.

If the deleted user has `role = 'therapist'`, their linked Therapist profile is
soft-deleted in the same operation — the reverse of Therapist's own soft delete,
which leaves the User intact (see [therapist.md](therapist.md)).

## Permissions

| Action | Who can do it |
|---|---|
| Create a user | Admin only |
| Read any user | Admin only |
| Update any user's name / email | Admin only |
| Change any user's role | Admin only |
| Soft-delete a user | Admin only |
| Read own profile | Any authenticated user |
| Update own name / email | Any authenticated user |
| Change own password | Any authenticated user |

## Endpoints

### Admin (`/users`, admin only)

| Method | Path | Description |
|---|---|---|
| `GET` | `/users` | List all users (paginated, filterable by role and deleted status) |
| `GET` | `/users/:id` | Get a user by ID |
| `POST` | `/users` | Create a user — role must be supplied; use `POST /therapists` for therapists |
| `PATCH` | `/users/:id` | Update name or email |
| `PATCH` | `/users/:id/role` | Change the user's role — kept as a distinct operation for auditability |
| `DELETE` | `/users/:id` | Soft-delete the user (and their therapist profile, if any) |

### Resource (`/me`, any authenticated user)

| Method | Path | Description |
|---|---|---|
| `GET` | `/me` | Get own profile |
| `PATCH` | `/me` | Update own name or email |
| `PATCH` | `/me/password` | Change own password — min 8 chars, at least one uppercase, lowercase, and digit |

## Errors

| HTTP Error | When it occurs |
|---|---|
| 404 Not Found | User ID does not exist |
| 409 Conflict | Email is already in use by another user |
| 422 Unprocessable Entity | Request body fails validation (e.g. missing required fields, password too weak) |

## Data Model

See [`database/schema.md`](../database/schema.md) → `users` table.
