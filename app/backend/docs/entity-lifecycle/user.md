# User Entity Lifecycle

## Overview

A User represents a staff member of the clinic. Users are created by admins only —
there is no self-registration. Users are never deleted through the API.

## Role

Every user has exactly one role, set at creation and changeable later by an admin:

| Role | Description |
|---|---|
| `admin` | Clinic manager — full admin access, no clinical profile |
| `therapist` | Practitioner — has an additional `Therapist` entity attached |

The role is a type discriminator, not a separate entity. An admin is just a User
with `role = 'admin'`. A therapist is a User with `role = 'therapist'` **plus** a
linked `Therapist` record — see [therapist.md](therapist.md).

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

## Endpoints

### Admin (`/users`, admin only)

| Method | Path | Description |
|---|---|---|
| `GET` | `/users` | List all users (paginated, filterable by role) |
| `GET` | `/users/:id` | Get a user by ID |
| `POST` | `/users` | Create a user — role must be supplied; use `POST /therapists` for therapists |
| `PATCH` | `/users/:id` | Update name or email |
| `PATCH` | `/users/:id/role` | Change the user's role — kept as a distinct operation for auditability |

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
