# Treatment Plan Entity Lifecycle

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
               ↑
           (in_progress or paused only)
```

| Status | Meaning |
|---|---|
| `open` | Plan created, treatment has not yet started |
| `in_progress` | At least one session has been delivered |
| `paused` | Treatment temporarily suspended — either party may initiate (e.g. client travel, temporary health issue, therapist unavailable) |
| `completed` | All planned treatments have been delivered |
| `cancelled` | Plan was abandoned before completion |

### Valid transitions

| From | To | Who triggers |
|---|---|---|
| `open` | `in_progress` | System — automatic when the first appointment for this plan is completed |
| `open` | `cancelled` | Therapist or Admin |
| `in_progress` | `paused` | Therapist |
| `in_progress` | `completed` | Therapist or System (when all items reach their target quantity) |
| `in_progress` | `cancelled` | Therapist or Admin |
| `paused` | `in_progress` | Therapist |
| `paused` | `cancelled` | Therapist or Admin |

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

Items are created alongside or after the plan. Items can be added or removed on
any plan that has not yet reached a terminal state (`completed` or `cancelled`).
An item cannot be removed once any sessions have been delivered
(`quantity_completed > 0`) — removing it would silently destroy delivery history.

When the last item's `quantity_completed` reaches its target, the system
automatically advances the plan to `completed`. Adding a new item to the plan
before that point resets the condition.
Deleting a plan removes all its items. A catalog treatment referenced by an item
cannot be deleted — retire it via `is_active: false` instead.

`quantity_completed` is updated automatically when an appointment linked to this
plan is marked as completed — it is never set manually.

## Dates

| Field | Meaning |
|---|---|
| `start_date` | When treatment is expected to begin (required) |
| `end_date` | Expected or actual end date (optional — may be set later or left open) |

`end_date`, when set, must be on or after `start_date`.

## Roles & Permissions

### Client

Clients have no direct access to treatment plans through this API. A plan is
created on their behalf by their assigned therapist. They are the subject of the
plan, not an actor in the system.

### Therapist

The therapist is the primary actor. A therapist can only act on plans they own.

| Action | Allowed |
|---|---|
| Create a plan for one of their clients | ✅ |
| View their own plans | ✅ |
| Update clinical fields (diagnosis, goals, contraindications) | ✅ |
| Add or remove items from their plan | ✅ (any non-terminal status) |
| Change plan status (pause, resume, complete, cancel) | ✅ |
| View or modify another therapist's plans | ❌ |
| Reassign the plan to a different therapist | ❌ |

### Admin

Admins have read access across all plans and limited write access. They cannot
modify clinical content — that belongs to the treating therapist.

| Action | Allowed |
|---|---|
| View all plans regardless of therapist | ✅ |
| Reassign the plan's therapist (e.g. when a therapist is unavailable) | ✅ |
| Adjust plan dates | ✅ |
| Force-cancel any plan (with reason) | ✅ |
| Create a plan | ❌ |
| Update clinical fields (diagnosis, goals, contraindications) | ❌ |
| Add or remove plan items | ❌ |

## Notes

- Deleting a therapist or client that owns a plan is blocked — historical records
  are protected.
- `contraindications` is optional — not all plans have clinical restrictions.
- The `completed` transition is manual, triggered by the therapist. The system
  only auto-advances a plan to `in_progress` (on the first completed appointment).

## Data Model

See [`database/schema.md`](../database/schema.md) → `treatment_plans` and
`treatment_plan_items` tables.
