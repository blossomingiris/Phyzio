# Treatment Entity Lifecycle

> **DRAFT** — No implementation yet. This document describes planned behavior
> based on the schema and clinic workflow. Details may change during implementation.

## Overview

A Treatment is an entry in the clinic's service catalog — a named, priced service
that can be included in treatment plans or linked to appointments. Treatments are
not patient records; they are reusable definitions managed by admins.

The catalog is expected to be small and relatively stable. Treatments are never
hard-deleted — once a service is used in a plan, removing it would break historical
records. Instead, treatments are deactivated via `is_active`.

## Active vs Inactive

`is_active` is the only lifecycle state:

| State | Meaning |
|---|---|
| `true` | Treatment is available to be added to plans and appointments |
| `false` | Treatment is retired — no longer offered, but historical records are preserved |

There is no status transition flow — activation and deactivation are simple boolean
toggles with no ordering constraints.

## Computed Field

`total_amount` is generated automatically by the database as
`price_per_unit × quantity`. It cannot be set manually and is always consistent
with the other two fields.

## Categories

| Value | Description |
|---|---|
| `ortho_sports` | Orthopedic and sports rehabilitation |
| `neuro_vestibular` | Neurological and vestibular therapy |
| `pediatrics` | Pediatric physical therapy |
| `geriatrics` | Geriatric physical therapy |
| `specialized_pt` | Other specialized physical therapy |
| `general_tech` | General techniques |
| `evaluations` | Assessment and evaluation sessions |

## Notes

- A treatment referenced by a treatment plan item cannot be deleted — retire it
  via `is_active: false` instead.
- A treatment linked to an appointment can be deleted — the appointment keeps its
  record but loses the treatment reference.
- All numeric fields have constraints: `price_per_unit >= 0`, `quantity > 0`,
  `duration_minutes > 0`.

## Data Model

See [`database/schema.md`](../database/schema.md) → `treatments` table.
