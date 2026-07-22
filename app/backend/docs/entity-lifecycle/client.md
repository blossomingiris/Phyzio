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

## Deletion Cascade

Soft-deleting a client (`DELETE /clients/:id`) also force-cancels every
non-terminal treatment plan (`open`, `in_progress`, `paused`) belonging to that
client — `cancellationReason` is set to `client_deleted` and `endDate` to the
deletion timestamp. Plan records are never deleted, only cancelled. See
[treatment-plan.md](treatment-plan.md) → Cascades.

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

## Endpoints

### Admin (`/clients`, admin only)

| Method | Path | Description |
|---|---|---|
| `GET` | `/clients` | List all clients (paginated, filterable by therapist ID) |
| `GET` | `/clients/:id` | Get any client by ID |
| `POST` | `/clients` | Create a client — `firstName` and `lastName` required; `therapistId` optional |
| `PATCH` | `/clients/:id` | Update any client including `therapistId` |
| `DELETE` | `/clients/:id` | Soft-delete a client |

### Resource (`/me/clients`, therapist only)

| Method | Path | Description |
|---|---|---|
| `GET` | `/me/clients` | List own clients (paginated, filterable by name) |
| `GET` | `/me/clients/:id` | Get one of own clients by ID |
| `PATCH` | `/me/clients/:id` | Update profile fields — cannot change `therapistId` |

Therapists cannot create or delete clients — those actions are admin-only.

## Errors

| HTTP Error | When it occurs |
|---|---|
| 404 Not Found | Client ID does not exist |
| 404 Not Found | Therapist accesses a client assigned to another therapist — existence is not revealed |
| 409 Conflict | Email is already in use by another client |
| 422 Unprocessable Entity | Request body fails validation (e.g. missing `firstName`, invalid email format) |

## Data Model

See [`database/schema.md`](../database/schema.md) → `clients` table.
