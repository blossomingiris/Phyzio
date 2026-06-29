# Treatment Entity Lifecycle

## Overview

A Treatment is an entry in the clinic's service catalog — a priced service that can
be included in treatment plans or linked to appointments. Treatments are not patient
records; they are reusable definitions managed by admins.

The catalog is expected to be small and relatively stable.

## Active vs Inactive

`is_active` is the only lifecycle state:

| State | Meaning |
|---|---|
| `true` | Treatment is available to be added to plans and appointments |
| `false` | Treatment is retired — no longer offered, but historical records are preserved |

Activation and deactivation are plain boolean toggles with no ordering constraints.
Treatments are never hard-deleted — once a service appears in a plan, removing it
would break historical records.

## Pricing and VAT

`price_per_unit` and `quantity` are set on create and can be updated at any time.
`total_amount` is derived automatically as `price_per_unit × quantity`; it cannot
be set manually.

VAT (24%, Greek standard rate) is not stored — it is computed on every read and
returned alongside the base amounts:

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

## Notes

- A treatment referenced by a treatment plan item cannot be deleted — retire it
  via `is_active: false` instead.
- A treatment linked to an appointment can be deleted — the appointment keeps its
  record but loses the treatment reference.
