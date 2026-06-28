# Appointment Entity Lifecycle

> **DRAFT** — No implementation yet. This document describes planned behavior
> based on the schema and clinic workflow. Details may change during implementation.

## Overview

An Appointment represents a scheduled session between a therapist and a client.
Appointments follow a status-driven lifecycle — from an initial request through
scheduling, confirmation, and a final outcome.

`client_id` is required — an appointment always belongs to a known client.
`therapist_id` is nullable; an appointment can be requested before a therapist
is assigned. `treatment_id` is optional throughout.

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

`completed` and `no_show` are terminal — no further transitions.

## Cancellation

Every cancellation requires a reason. The reason is a discriminated union — `other`
additionally requires a free-text note; the remaining values do not.

| Reason | When to use |
|---|---|
| `client_request` | Client actively asked to cancel |
| `client_unreachable` | Clinic tried to confirm, client did not respond |
| `therapist_unavailable` | Therapist cannot attend |
| `other` | Anything else — a note is required |


`cancellation_reason` and `cancellation_note` are null on all non-cancelled
appointments and must be set when transitioning to `cancelled`.

## Notes

- `treatment_id` links to the service catalog and is optional — it can be set at
  any point or left unset.
- The appointment duration is derived from `started_at` / `ended_at`. `ended_at`
  must be strictly after `started_at`.
- Deleting a client that has appointments is blocked — historical records are
  protected. Deleting a therapist is also blocked until appointments are reassigned
  or cancelled.

## Data Model

See [`database/schema.md`](../database/schema.md) → `appointments` table.
