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

`completed` and `cancelled` are terminal — no further transitions.

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

## Cancellation

Every cancellation requires a reason. `other` additionally requires a free-text
note — the same discriminated union pattern as appointments.

| Reason | When to use |
|---|---|
| `client_request` | Client asked to stop the plan |
| `client_unreachable` | Client stopped responding or attending |
| `therapist_referral` | Client referred to an external specialist |
| `other` | Anything else — a note is required |
| `client_deleted` | System-only — set automatically when the client is soft-deleted, see Cascades below |

`cancellation_reason` and `cancellation_note` are null on all non-cancelled plans
and must be set when transitioning to `cancelled`. `client_deleted` cannot be
chosen manually through either the admin or therapist cancel endpoints — it is
rejected by request validation.

## Cascades

Two entity-lifecycle events on other domains automatically affect treatment plans:

| Trigger | Effect |
|---|---|
| Client is soft-deleted (`DELETE /clients/:id`) | Every non-terminal plan (`open`, `in_progress`, `paused`) for that client is force-cancelled: `status` → `cancelled`, `cancellationReason` → `client_deleted`, `endDate` → the deletion timestamp. The plan record itself is never deleted. |
| Therapist is marked unavailable (`PATCH /therapists/:id` with `isActive: false`) | Every `in_progress` plan owned by that therapist is auto-paused: `status` → `paused`. `open` and already-`paused` plans are untouched. |

Both cascades run in the same database transaction as the triggering update, so
they cannot partially apply. Neither cascade auto-reverses: reactivating a
therapist (`isActive: true`) does **not** auto-resume their paused plans —
resuming is a manual action.

## Plan Items

Each item links one catalog treatment to the plan and tracks delivery progress:

| Field | Meaning |
|---|---|
| `treatment_id` | Which service from the catalog |
| `quantity_completed` | How many sessions of this service have been delivered so far |

The target quantity (how many sessions are planned) comes from `treatments.quantity`
in the catalog. Progress is `quantity_completed / treatments.quantity`.

The same treatment can appear at most once per plan — adding it twice is rejected.
Items can be added or removed on any plan that has not reached a terminal state.
An item cannot be removed once any sessions have been delivered (`quantity_completed > 0`).

When all items reach their target quantity, the system automatically advances the
plan to `completed`. Adding a new item before that point resets the condition.

`quantity_completed` is updated automatically when a linked appointment is marked as
completed with a `treatmentPlanItemId` — it is never set manually.

## Dates

| Field | Meaning |
|---|---|
| `start_date` | When treatment is expected to begin (required) |
| `end_date` | Expected or actual end date (optional — may be set later or left open) |

`end_date`, when set, must be on or after `start_date`.

## Permissions

### Client

Clients have no direct access to treatment plans through this API. A plan is
created on their behalf by their assigned therapist.

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
| Reassign the plan's therapist | ✅ |
| Adjust plan dates | ✅ |
| Force-cancel any plan (with reason) | ✅ |
| Create a plan | ❌ |
| Update clinical fields (diagnosis, goals, contraindications) | ❌ |
| Add or remove plan items | ❌ |

## Endpoints

### Resource (`/me/treatment-plans`, therapist only)

| Method | Path | Description |
|---|---|---|
| `GET` | `/me/treatment-plans` | List own plans (paginated, filterable by status, client) |
| `GET` | `/me/treatment-plans/:id` | Get own plan by ID (includes items) |
| `POST` | `/me/treatment-plans` | Create a plan with initial items |
| `PATCH` | `/me/treatment-plans/:id` | Update clinical fields and / or status |
| `POST` | `/me/treatment-plans/:id/items` | Add a treatment to the plan |
| `DELETE` | `/me/treatment-plans/:id/items/:itemId` | Remove a treatment from the plan |

### Admin (`/treatment-plans`, admin only)

| Method | Path | Description |
|---|---|---|
| `GET` | `/treatment-plans` | List all plans (paginated, filterable by status, client, therapist; searchable by plan ID, client name, or therapist name) |
| `GET` | `/treatment-plans/:id` | Get any plan by ID (includes items) |
| `PATCH` | `/treatment-plans/:id` | Update therapist, dates, or force-cancel |

## Errors

| HTTP Error | When it occurs |
|---|---|
| 400 Bad Request | Invalid status transition; cancellation reason required; item has completed sessions |
| 404 Not Found | Plan not found or therapist accessing another's plan |
| 409 Conflict | Treatment already exists in the plan |
| 422 Unprocessable Entity | Request body fails validation |

## Data Model

See [`database/schema.md`](../database/schema.md) → `treatment_plans` and
`treatment_plan_items` tables.
