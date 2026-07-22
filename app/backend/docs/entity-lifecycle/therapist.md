# Therapist Entity Lifecycle

## Overview

A Therapist is an extension of the User entity for practitioners. It holds clinical
profile data (speciality, phone, working hours). Every Therapist has a corresponding
User — you cannot have a Therapist without a User.

## Relationship to User

| Aspect | Detail |
|---|---|
| Identity | Therapist shares the same ID as its User — there is no separate therapist ID |
| Creation | Always atomic — both the user account and therapist profile are created together |
| Removal | Soft-deleting a User also soft-deletes their therapist profile — see [user.md](user.md) |
| Reverse | Soft-deleting the Therapist leaves the User intact |

## Soft Delete

`DELETE /therapists/:id` marks the therapist as deleted. It does **not** remove the
user account, set `isActive: false`, or invalidate login credentials.

Intended flow before removing a therapist:
1. Reassign or close their active treatment plans.
2. Reassign or cancel their upcoming appointments.
3. Their assigned clients lose the assignment automatically and can be reassigned.

### `isActive` vs `deletedAt`

| Flag | Meaning |
|---|---|
| `isActive: false` | Therapist is not taking new appointments (still visible, still logs in) |
| `deletedAt` set | Therapist is considered removed — used for filtering |

## Permissions

| Action | Who can do it |
|---|---|
| Create a therapist | Admin only |
| Read / list therapists | Admin only |
| Update therapist profile | Admin only |
| Soft-delete a therapist | Admin only |
| Update own phone / working hours | The therapist themselves (via `/me`) |

## Endpoints

### Admin (`/therapists`, admin only)

| Method | Path | Description |
|---|---|---|
| `GET` | `/therapists` | List therapist profiles (paginated) |
| `GET` | `/therapists/:id` | Get a therapist profile |
| `POST` | `/therapists` | Create a therapist — user account and profile created atomically |
| `PATCH` | `/therapists/:id` | Update therapist fields (`speciality`, `phone`, `workingHours`, `isActive`) |
| `DELETE` | `/therapists/:id` | Soft-delete the therapist |

To update a therapist's name, email, or role use the User endpoints
(`PATCH /users/:id` and `PATCH /users/:id/role`).

### Resource (`/me`, authenticated therapist)

`GET /me` returns a `therapist` nested object when the caller is a therapist.
`PATCH /me` accepts therapist fields (`phone`, `workingHours`) alongside user fields
in a single request. For admins the `therapist` key is omitted entirely.

## Errors

| HTTP Error | When it occurs |
|---|---|
| 404 Not Found | Therapist ID does not exist |
| 409 Conflict | Email is already in use by another user |
| 422 Unprocessable Entity | Request body fails validation (e.g. missing required fields, invalid email format) |

## Data Model

See [`database/schema.md`](../database/schema.md) → `therapists` table.
