# Treatment Entity Lifecycle

## Overview

A Treatment is an entry in the clinic's service catalog — a priced service that can
be included in treatment plans. Treatments are not patient records; they are reusable
definitions managed by admins. The catalog is expected to be small and relatively stable.

## Active vs Inactive

`is_active` is the only lifecycle state:

| State | Meaning |
|---|---|
| `true` | Treatment is available to be added to plans |
| `false` | Treatment is retired — no longer offered, but historical records are preserved |

Activation and deactivation are plain boolean toggles with no ordering constraints.
Treatments are never hard-deleted — once a service appears in a plan, removing it
would break historical records. Retire unused treatments via `is_active: false`.

## Pricing and VAT

`price_per_unit` and `quantity` are set on create and can be updated at any time.
`total_amount` is derived automatically as `price_per_unit × quantity`; it cannot
be set manually.

VAT (24%, Greek standard rate) is not stored — it is computed on every read:

| Field | Description |
|---|---|
| `totalAmount` | Pre-tax total (`price_per_unit × quantity`) |
| `vatRate` | Rate applied (0.24) |
| `vatAmount` | VAT portion (`totalAmount × 0.24`) |
| `totalWithVat` | Final amount the client pays |

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

## Permissions

| Action | Who can do it |
|---|---|
| Create a treatment | Admin only |
| Read / list treatments | Admin only |
| Update a treatment | Admin only |

There are no therapist-facing (resource) treatment endpoints.

## Endpoints

### Admin (`/treatments`, admin only)

| Method | Path | Description |
|---|---|---|
| `GET` | `/treatments` | List all treatments (paginated, filterable by category and `isActive`) |
| `GET` | `/treatments/:id` | Get a treatment by ID |
| `POST` | `/treatments` | Create a treatment |
| `PATCH` | `/treatments/:id` | Update a treatment — including toggling `isActive` |

## Errors

| HTTP Error | When it occurs |
|---|---|
| 404 Not Found | Treatment ID does not exist |
| 422 Unprocessable Entity | Request body fails validation (e.g. missing required fields, invalid category) |

## Data Model

See [`database/schema.md`](../database/schema.md) → `treatments` table.
