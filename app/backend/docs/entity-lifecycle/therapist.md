# Therapist Entity Lifecycle

## Overview

A Therapist is an extension of the User entity for practitioners. It holds clinical
profile data (speciality, phone, working hours). Every Therapist has a corresponding
User — you cannot have a Therapist without a User.

Therapists can be soft-deleted without removing the underlying User or erasing
historical data.

## Relationship to User

| Aspect | Detail |
|---|---|
| Identity | Therapist shares the same ID as its User — there is no separate therapist ID |
| Creation | Always atomic — both the user account and therapist profile are created together |
| Removal | Removing a User also removes their therapist profile |
| Reverse | Soft-deleting the Therapist leaves the User intact |

## Endpoints

### Admin (`/therapists`, admin only)

| Method | Path | Description |
|---|---|---|
| `GET` | `/therapists` | List therapist profiles (paginated) |
| `GET` | `/therapists/:id` | Get a therapist profile |
| `POST` | `/therapists` | Create a therapist (user account + profile, atomic) |
| `PATCH` | `/therapists/:id` | Update therapist-specific fields |
| `DELETE` | `/therapists/:id` | Soft-delete the therapist |

### Resource (`/me`, authenticated therapist)

The `/me` endpoint is defined on the User entity but returns a `therapist`
nested object when the caller is a therapist:

```json
{
  "id": 1,
  "firstName": "Ana",
  "lastName": "Silva",
  "email": "ana@clinic.com",
  "role": "therapist",
  "therapist": {
    "speciality": "orthopedic",
    "phone": "+1-555-0100",
    "workingHours": { "mon": [{ "start": "09:00", "end": "17:00" }] },
    "isActive": true
  },
  "createdAt": "2024-03-10T09:00:00.000Z",
  "updatedAt": "2025-01-18T14:22:00.000Z"
}
```

`PATCH /me` accepts therapist fields (`phone`, `workingHours`) alongside user
fields in a single request.

For admin users the `therapist` key is omitted entirely — not null, just absent.

## Permissions

| Action | Who can do it |
|---|---|
| Create a therapist | Admin only |
| Read / list therapists | Admin only |
| Update therapist profile | Admin only |
| Soft-delete a therapist | Admin only |
| Update own phone / working hours | The therapist themselves (via `/me`) |

## Errors

| HTTP Error | When it occurs |
|---|---|
| 404 Not Found | Therapist ID does not exist |
| 409 Conflict | Email is already in use by another user |
| 422 Unprocessable Entity | Request body fails validation (e.g. missing required fields, invalid email format) |

## Creating a Therapist

`POST /therapists` is the only creation path. It accepts all User fields plus
therapist-specific fields. Both the user account and the therapist profile are
created atomically — if either fails, nothing is saved.

The response is a flat merged object (user fields + therapist fields).

Do not use `POST /users` to create therapists. That endpoint only creates the user
account and leaves the therapist profile missing, which breaks the data model.

## Updating a Therapist

`PATCH /therapists/:id` accepts therapist-specific fields only:
`speciality`, `phone`, `workingHours`, `isActive`. All are optional.

To update the therapist's name, email, or role, use the User endpoints
(`PATCH /users/:id` and `PATCH /users/:id/role`).

## Soft Delete

`DELETE /therapists/:id` marks the therapist as deleted. It does **not**:
- Remove the user account.
- Set `isActive: false` (these are independent flags).
- Invalidate the therapist's login credentials.

The intended flow before removing a therapist:

1. Reassign or close their active treatment plans.
2. Reassign or cancel their upcoming appointments.
3. Their assigned clients lose the assignment automatically and can be reassigned.

### `isActive` vs `deletedAt`

These are separate concepts that can be set independently:

| Flag | Meaning |
|---|---|
| `isActive: false` | Therapist is not taking new appointments (still visible, still logs in) |
| `deletedAt` set | Therapist is considered removed — used for filtering in future features |

## Data Model

See [`database/schema.md`](../database/schema.md) → `therapists` table.
