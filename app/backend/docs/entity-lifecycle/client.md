# Client Entity Lifecycle

## Overview

A Client is a patient of the clinic. Clients are independent records — they do not
have login credentials and are not users of the system. A client can be assigned
to a therapist or left unassigned. Clients can be soft-deleted but not hard-deleted
through the API.

## Therapist Assignment

`therapistId` is optional. A client with no therapist assigned is valid and visible
to admins. Therapists can only see clients assigned to them.

When a therapist is removed, the client loses their assignment and becomes visible
to admins only until reassigned.

## Endpoints

### Admin (`/clients`, admin only)

| Method | Path | Description |
|---|---|---|
| `GET` | `/clients` | List all clients (paginated, filterable by therapist ID) |
| `GET` | `/clients/:id` | Get any client by ID |
| `POST` | `/clients` | Create a client |
| `PATCH` | `/clients/:id` | Update any client |
| `DELETE` | `/clients/:id` | Soft-delete a client |

### Resource (`/me/clients`, therapist only)

| Method | Path | Description |
|---|---|---|
| `GET` | `/me/clients` | List own clients (paginated, filterable by name) |
| `GET` | `/me/clients/:id` | Get one of own clients by ID |
| `PATCH` | `/me/clients/:id` | Update one of own clients |

Therapists cannot create or delete clients — those actions are admin-only.
There are no public (unauthenticated) client endpoints.

## Permissions

| Action | Who can do it |
|---|---|
| Create a client | Admin only |
| Read any client | Admin only |
| Filter clients by therapist ID | Admin only |
| Assign / change therapist | Admin only |
| Soft-delete a client | Admin only |
| Read own clients | Therapist (own clients only) |
| Update a client's profile fields | Admin (any client) or therapist (own clients only) |

## Errors

| HTTP Error | When it occurs |
|---|---|
| 404 Not Found | Client ID does not exist |
| 404 Not Found | Therapist accesses a client assigned to another therapist — existence is not revealed |
| 409 Conflict | Email is already in use by another client |
| 422 Unprocessable Entity | Request body fails validation (e.g. missing `firstName`, invalid email format) |

## Creating a Client

`POST /clients` — all fields except `firstName` and `lastName` are optional.

`therapistId` can be supplied at creation or set later via update. If omitted,
the client is created as unassigned.

Email is optional but must be unique across all clients when provided.

## Updating a Client

`PATCH /clients/:id` and `PATCH /me/clients/:id` accept the same profile fields
(`firstName`, `lastName`, `birthDate`, `phone`, `email`, `origin`,
`preferredCommunication`, `medicalNotes`). All are optional — send only what changes.

The key difference between the two:

| Field | Admin | Therapist (resource) |
|---|---|---|
| Profile fields | yes | yes |
| `therapistId` | yes | no |

A therapist cannot reassign a client to themselves or to someone else — only admins
control assignment.

## Soft Delete

`DELETE /clients/:id` marks the client as deleted. The record remains in the system
and is still returned in listings — callers can identify soft-deleted clients by the
presence of `deletedAt` in the response.

## Response Shape

Every client response includes a `therapist` nested object (or `null` if unassigned).
This is a summary — not the full Therapist entity:

```json
{
  "id": 42,
  "therapist": {
    "id": 1,
    "firstName": "Ana",
    "lastName": "Silva",
    "email": "ana@clinic.com",
    "speciality": "orthopedic",
    "phone": "+1-555-0100",
    "isActive": true
  },
  "firstName": "João",
  "lastName": "Costa",
  "birthDate": "1985-03-22",
  "phone": "+1-555-0200",
  "email": "joao@example.com",
  "origin": "phone",
  "preferredCommunication": "whats_up",
  "medicalNotes": null,
  "deletedAt": null,
  "createdAt": "2024-06-05T11:30:00.000Z",
  "updatedAt": "2025-02-14T09:45:00.000Z"
}
```

When unassigned, `therapist` is `null` (not omitted).

## Data Model

See [`database/schema.md`](../database/schema.md) → `clients` table.
