# Appointment Entity Lifecycle

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

## Validation & Business Rules

| Rule | Where enforced | Status |
|---|---|---|
| `ended_at > started_at` | DB CHECK constraint + service layer | ✅ Implemented |
| Valid status transition | `VALID_TRANSITIONS` map in service | ✅ Implemented |
| Cancellation reason required on cancel | AJV discriminated union (DTO) | ✅ Implemented |
| Cancellation note required when reason is `other` | Service layer | ✅ Implemented |
| Therapist double-booking prevention | Service layer (`checkTherapistOverlap`) | ✅ Implemented |
| Client double-booking prevention | — | 🔲 Future |
| Therapist working hours validation | — | 🔲 Future |
| Appointment must be in the future on create | — | 🔲 Future |
| Minimum appointment duration | — | 🔲 Out of scope (MVP) |

### Overlap detection detail

`checkTherapistOverlap` queries active appointments (status not in `cancelled`,
`no_show`) for the same therapist where the time ranges intersect
(`started_at < new.ended_at AND ended_at > new.started_at`).
It runs on create (when `therapist_id` is set) and on update (when
`therapist_id`, `started_at`, or `ended_at` changes). The appointment being
updated is excluded from its own check.

## Notes

- `treatment_id` links to the service catalog and is optional — it can be set at
  any point or left unset.
- The appointment duration is derived from `started_at` / `ended_at`.
- Deleting a client or therapist that has appointments is blocked by FK RESTRICT
  constraints — historical records are protected. The service returns a 409 with
  the name of the referencing table.
- Appointments themselves are hard-deleted (no `deleted_at` column).

## Data Model

See [`database/schema.md`](../database/schema.md) → `appointments` table.
