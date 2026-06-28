# Treatment Plan Entity Lifecycle

> **DRAFT** — No implementation yet. This document describes planned behavior
> based on the schema and clinic workflow. Details may change during implementation.

## Overview

A Treatment Plan is a personalized clinical program created by a therapist for a
specific client. It defines the diagnosis, goals, and the set of services
(treatments) to be delivered over a period of time.

The plan is composed of two database tables:

| Part | Role |
|---|---|
| `treatment_plans` | Aggregate root — clinical context, status, dates, ownership |
| `treatment_plan_items` | Line items — which catalog treatments are included and how many sessions have been completed |

A plan always belongs to exactly one client (required, cannot be changed). The
assigned therapist can be updated — for example when a therapist is unavailable
and the plan is reassigned to a colleague.

## Status Transitions

```
open ──> in_progress ──> completed
  │        │    ↑
  │        ↓    │
  │      paused─┘
  │        │
  └────────┴──> cancelled
```

| Status | Meaning |
|---|---|
| `open` | Plan created, treatment has not yet started |
| `in_progress` | At least one session has been delivered |
| `paused` | Treatment temporarily suspended (e.g. therapist unavailable) |
| `completed` | All planned treatments have been delivered |
| `cancelled` | Plan was abandoned before completion |

### Valid transitions

| From | To | Who can trigger |
|---|---|---|
| `open` | `in_progress` | Admin |
| `open` | `paused` | Admin |
| `open` | `cancelled` | Admin |
| `in_progress` | `paused` | Admin |
| `in_progress` | `completed` | Admin |
| `in_progress` | `cancelled` | Admin |
| `paused` | `in_progress` | Admin |
| `paused` | `cancelled` | Admin |

`completed` and `cancelled` are terminal — no further transitions.

## Cancellation

Every cancellation requires a reason. `other` additionally requires a free-text
note — the same discriminated union pattern as appointments.

| Reason | When to use |
|---|---|
| `client_request` | Client asked to stop the plan |
| `client_unreachable` | Client stopped responding or attending |
| `therapist_referral` | Client referred to an external specialist |
| `other` | Anything else — a note is required |

`cancellation_reason` and `cancellation_note` are null on all non-cancelled plans
and must be set when transitioning to `cancelled`.

## Plan Items

Each item links one catalog treatment to the plan and tracks delivery progress:

| Field | Meaning |
|---|---|
| `treatment_id` | Which service from the catalog |
| `quantity_completed` | How many sessions of this service have been delivered so far |

The target quantity (how many sessions are planned) comes from `treatments.quantity`
in the catalog. Progress is `quantity_completed / treatments.quantity`.

The same treatment can appear at most once per plan — adding it twice is rejected.

Items are created alongside or after the plan. Deleting a plan removes all its
items. A catalog treatment referenced by an item cannot be deleted — retire it
via `is_active: false` instead.

## Dates

| Field | Meaning |
|---|---|
| `start_date` | When treatment is expected to begin (required) |
| `end_date` | Expected or actual end date (optional — may be set later or left open) |

`end_date`, when set, must be on or after `start_date`.

## Notes

- Deleting a therapist or client that owns a plan is blocked — historical records
  are protected.
- `contraindications` is optional — not all plans have clinical restrictions.
- Whether the plan transitions to `completed` automatically when all items reach
  their target quantity, or manually by the admin/therapist, is to be decided
  during implementation.

## Data Model

See [`database/schema.md`](../database/schema.md) → `treatment_plans` and
`treatment_plan_items` tables.
