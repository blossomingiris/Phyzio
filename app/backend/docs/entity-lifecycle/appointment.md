# Appointment Entity Lifecycle

## Overview

An Appointment represents a scheduled session between a therapist and a client.
Appointments follow a status-driven lifecycle — from an initial request through
scheduling, confirmation, and a final outcome.

`client_id` is required — an appointment always belongs to a known client.
`therapist_id` is nullable; an appointment can be requested before a therapist
is assigned. `treatment_plan_id` is optional — an appointment can be linked to a
treatment plan or booked as a standalone session.

## Status Transitions

```
requested ──> scheduled ──> confirmed ──> completed
    │              │              │
    └──────────────┴──────────────┴──> cancelled
                                  │
                                  └──> no_show
```

| Status | Meaning |
|---|---|
| `requested` | Initial state — client is set, therapist may not be assigned yet |
| `scheduled` | Therapist and client are assigned, time slot is set |
| `confirmed` | Both parties have confirmed the appointment |
| `completed` | Appointment took place successfully |
| `no_show` | Client did not attend the confirmed appointment |
| `cancelled` | Appointment was cancelled — can happen from any active state |

`completed` and `no_show` are terminal — no further transitions.

### Valid transitions

| From | To | Who can trigger |
|---|---|---|
| `requested` | `scheduled` | Admin |
| `requested` | `cancelled` | Admin |
| `scheduled` | `confirmed` | Admin or therapist (own appointments only) |
| `scheduled` | `cancelled` | Admin or therapist (own appointments only) |
| `confirmed` | `completed` | Admin |
| `confirmed` | `no_show` | Admin |
| `confirmed` | `cancelled` | Admin |

## Cancellation

Every cancellation requires a reason. `other` additionally requires a free-text note.

| Reason | When to use |
|---|---|
| `client_request` | Client actively asked to cancel |
| `client_unreachable` | Clinic tried to confirm, client did not respond |
| `therapist_unavailable` | Therapist cannot attend |
| `other` | Anything else — a note is required |

`cancellation_reason` and `cancellation_note` are null on all non-cancelled
appointments and must be set when transitioning to `cancelled`.

## Business Rules

| Rule | Notes |
|---|---|
| `ended_at > started_at` | Required on create and update |
| Valid status transition only | Enforced against the transitions table above |
| Cancellation reason required on cancel | Discriminated union — reason is always required |
| Cancellation note required when reason is `other` | Enforced server-side |
| Therapist double-booking prevention | Active appointments in the same time slot are rejected |
| Client double-booking prevention | Not implemented |
| Therapist working hours validation | Not implemented |
| Appointment must be in the future on create | Not implemented |

Overlap detection checks active appointments (status not in `cancelled`, `no_show`)
for the same therapist where time ranges intersect. Runs on create and on any update
that changes `therapist_id`, `started_at`, or `ended_at`.

## Permissions

| Action | Who can do it |
|---|---|
| Create an appointment | Admin only |
| View all appointments | Admin only |
| View own appointments | Therapist (own only) |
| Update appointment details | Admin only |
| Delete an appointment | Admin only |
| Transition to `completed` / `no_show` | Admin only |
| Transition to `confirmed` / `cancelled` | Admin or therapist (own only) |

## Endpoints

### Admin (`/appointments`, admin only)

| Method | Path | Description |
|---|---|---|
| `GET` | `/appointments` | List all appointments (paginated, filterable by status, therapist, client, date range) |
| `GET` | `/appointments/:id` | Get an appointment by ID |
| `POST` | `/appointments` | Create an appointment |
| `PATCH` | `/appointments/:id` | Update appointment details (therapist, client, time, notes) |
| `PATCH` | `/appointments/:id/status` | Change appointment status |
| `DELETE` | `/appointments/:id` | Delete an appointment |

### Resource (`/me/appointments`, therapist only)

| Method | Path | Description |
|---|---|---|
| `GET` | `/me/appointments` | List own appointments (paginated, filterable) |
| `GET` | `/me/appointments/:id` | Get own appointment by ID |
| `PATCH` | `/me/appointments/:id/status` | Change status — `confirmed` or `cancelled` only |

When completing an appointment linked to a treatment plan, the request may carry an
optional `treatmentPlanItemId` to credit the specific plan item with one completed session.

## Errors

| HTTP Error | When it occurs |
|---|---|
| 400 Bad Request | Invalid status transition; `ended_at` not after `started_at`; cancellation note required |
| 404 Not Found | Appointment not found or therapist accessing another's appointment |
| 409 Conflict | Therapist already has an active appointment in the requested time slot |
| 422 Unprocessable Entity | Request body fails validation |

## Data Model

See [`database/schema.md`](../database/schema.md) → `appointments` table.
