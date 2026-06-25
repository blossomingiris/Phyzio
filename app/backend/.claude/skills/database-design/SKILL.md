---
name: database-design
description: Authoritative database schema reference, eg. tables, columns, relationships, FK delete behavior, enums, CHECK constraints, and planned indexes. Use this whenever adding or changing database tables, editing app/database/schemas.ts, writing Drizzle relations, generating/reviewing migrations, or seeding the database.
---

# Database Design

> Conventions for all tables:

- column names are `snake_case`
- enum tags are `snake_case`
- all `id` are `serial`
- all timestamps are `timestamptz NOT NULL DEFAULT now()`

---

## Relationships map

```
users           (1) ──< (0..1) therapists            therapists.user_id → users.id
therapists      (1) ──< (many) clients               clients.therapist_id → therapists.id   (nullable = assigned)
clients         (1) ──< (many) treatment_plans       treatment_plans.client_id
therapists      (1) ──< (many) treatment_plans       treatment_plans.therapist_id
treatment_plans (1) ──< (many) treatment_plan_items  treatment_plan_items.treatment_plan_id
treatments      (1) ──< (many) treatment_plan_items  treatment_plan_items.treatment_id      (service catalog)
clients         (1) ──< (many) appointments          appointments.client_id
therapists      (1) ──< (many) appointments          appointments.therapist_id
treatments      (0..1) ──< (many) appointments       appointments.treatment_id              (nullable delivery link)
```

---

## Tables

### `users`

| Column     | Type           | Constraints                         | Enum values      |
| ---------- | -------------- | ----------------------------------- | ---------------- |
| id         | serial         | PK                                  |                  |
| first_name | varchar(255)   | NOT NULL                            |                  |
| last_name  | varchar(255)   | NOT NULL                            |                  |
| email      | varchar(255)   | NOT NULL, UNIQUE (case-insensitive) |                  |
| password   | varchar(255)   | NOT NULL (hashed)                   |                  |
| role       | user_role enum | NOT NULL                            | admin, therapist |
| created_at | timestamptz    | NOT NULL DEFAULT now()              |                  |
| updated_at | timestamptz    | NOT NULL DEFAULT now()              |                  |

### `therapists` (profile extension of users)

| Column        | Type            | Constraints                                                                                         | Enum values                                                                                               |
| ------------- | --------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| id            | serial          | PK                                                                                                  |                                                                                                           |
| user_id       | integer         | NULL, UNIQUE, FK → users.id                                                                         |                                                                                                           |
| speciality    | speciality enum | NOT NULL                                                                                            | orthopedic, sports, neurology, pediatric, geriatric, cardio_pulmonary, pelvic_floor, oncology, vestibular |
| phone         | varchar(50)     | NOT NULL                                                                                            |                                                                                                           |
| working_hours | jsonb           | NOT NULL — typed `$type<WorkingHours>()`; shape `{ "mon": [{"start":"09:00","end":"17:00"}], ... }` |                                                                                                           |
| is_active     | boolean         | NOT NULL DEFAULT true                                                                               |                                                                                                           |
| deleted_at    | timestamptz     | NULL (soft-delete; NULL = active)                                                                   |                                                                                                           |
| created_at    | timestamptz     | NOT NULL DEFAULT now()                                                                              |                                                                                                           |
| updated_at    | timestamptz     | NOT NULL DEFAULT now()                                                                              |                                                                                                           |

### `clients`

| Column                  | Type               | Constraints                                   | Enum values               |
| ----------------------- | ------------------ | --------------------------------------------- | ------------------------- |
| id                      | serial             | PK                                            |                           |
| therapist_id            | integer            | NULL, FK → therapists.id (assigned therapist) |                           |
| first_name              | varchar(255)       | NOT NULL                                      |                           |
| last_name               | varchar(255)       | NOT NULL                                      |                           |
| birth_date              | date               | NULL                                          |                           |
| email                   | varchar(255)       | NULL, UNIQUE (case-insensitive)               |                           |
| origin                  | origin enum        | NULL                                          | whats_up, phone, walk_in, other |
| preferred_communication | communication enum | NOT NULL DEFAULT 'email'                      | whats_up, phone, email    |
| medical_notes           | text               | NULL                                          |                           |
| deleted_at              | timestamptz        | NULL (soft-delete; NULL = active)             |                           |
| created_at              | timestamptz        | NOT NULL DEFAULT now()                        |                           |
| updated_at              | timestamptz        | NOT NULL DEFAULT now()                        |                           |

### `treatments` (catalog of services)

| Column           | Type          | Constraints                                             | Enum values                                                                                       |
| ---------------- | ------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| id               | serial        | PK                                                      |                                                                                                   |
| category         | category enum | NOT NULL                                                | ortho_sports, neuro_vestibular, pediatrics, geriatrics, specialized_pt, general_tech, evaluations |
| price_per_unit   | numeric(10,2) | NOT NULL                                                |                                                                                                   |
| quantity         | smallint      | NOT NULL                                                |                                                                                                   |
| total_amount     | numeric(10,2) | GENERATED ALWAYS AS (price_per_unit \* quantity) STORED |                                                                                                   |
| duration_minutes | smallint      | NOT NULL                                                |                                                                                                   |
| is_active        | boolean       | NOT NULL DEFAULT true                                   |                                                                                                   |
| created_at       | timestamptz   | NOT NULL DEFAULT now()                                  |                                                                                                   |
| updated_at       | timestamptz   | NOT NULL DEFAULT now()                                  |                                                                                                   |

### `treatment_plans` (plan-level, one row per plan)

| Column             | Type        | Constraints                  | Enum values                              |
| ------------------ | ----------- | ---------------------------- | ---------------------------------------- |
| id                 | serial      | PK                           |                                          |
| therapist_id       | integer     | NOT NULL, FK → therapists.id |                                          |
| client_id          | integer     | NOT NULL, FK → clients.id    |                                          |
| primary_diagnostic | text        | NOT NULL                     |                                          |
| clinical_goals     | text        | NOT NULL                     |                                          |
| contraindications  | text        | NULL                         |                                          |
| status             | status enum | NOT NULL DEFAULT 'open'      | open, in_progress, completed, cancelled  |
| start_date         | timestamptz | NOT NULL                     |                                          |
| end_date           | timestamptz | NULL                         |                                          |
| created_at         | timestamptz | NOT NULL DEFAULT now()       |                                          |
| updated_at         | timestamptz | NOT NULL DEFAULT now()       |                                          |

### `treatment_plan_items` (one row per chosen service)

| Column             | Type        | Constraints                             | Enum values |
| ------------------ | ----------- | --------------------------------------- | ----------- |
| id                 | serial      | PK                                      |             |
| treatment_plan_id  | integer     | NOT NULL, FK → treatment_plans.id       |             |
| treatment_id       | integer     | NOT NULL, FK → treatments.id            |             |
| quantity_completed | smallint    | NOT NULL DEFAULT 0                      |             |
| created_at         | timestamptz | NOT NULL DEFAULT now()                  |             |
| updated_at         | timestamptz | NOT NULL DEFAULT now()                  |             |
|                    |             | UNIQUE(treatment_plan_id, treatment_id) |             |

### `appointments`

| Column       | Type        | Constraints                  | Enum values                                                    |
| ------------ | ----------- | ---------------------------- | -------------------------------------------------------------- |
| id           | serial      | PK                           |                                                                |
| therapist_id | integer     | NULL, FK → therapists.id     |                                                                |
| client_id    | integer     | NULL, FK → clients.id        |                                                                |
| treatment_id | integer     | NULL, FK → treatments.id     |                                                                |
| started_at   | timestamptz | NOT NULL                     |                                                                |
| ended_at     | timestamptz | NOT NULL                     |                                                                |
| notes        | text        | NULL                         |                                                                |
| status       | status enum | NOT NULL DEFAULT 'requested' | requested, scheduled, confirmed, completed, no_show, cancelled |
| created_at   | timestamptz | NOT NULL DEFAULT now()       |                                                                |
| updated_at   | timestamptz | NOT NULL DEFAULT now()       |                                                                |

---

## FK delete behavior (`onDelete`)

`serial` PKs never change, so `onUpdate` is omitted everywhere.

| Foreign key                                              | onDelete | Rationale                                                                    |
| -------------------------------------------------------- | -------- | ---------------------------------------------------------------------------- |
| therapists.user_id → users                               | CASCADE  | profile meaningless without its user                                         |
| clients.therapist_id → therapists                        | SET NULL | reassign client, keep client record                                          |
| treatment_plans.client_id → clients                      | RESTRICT | protect medical history                                                      |
| treatment_plans.therapist_id → therapists                | RESTRICT | keep authorship/history                                                      |
| treatment_plan_items.treatment_plan_id → treatment_plans | CASCADE  | items die with their plan                                                    |
| treatment_plan_items.treatment_id → treatments           | RESTRICT | don't delete a catalog service that is in use (retire via `is_active=false`) |
| appointments.client_id → clients                         | RESTRICT | protect history                                                              |
| appointments.therapist_id → therapists                   | RESTRICT | protect history                                                              |
| appointments.treatment_id → treatments                   | SET NULL | optional link; clearing it must not delete the appointment                   |

Rule of thumb: **CASCADE toward an owner parent, RESTRICT/SET NULL toward a shared/reference parent.** The RESTRICT choices pair with the soft-delete (`deleted_at`) on `clients` / `therapists` — see Best practices.

---

## CHECK constraints

| Table                | Constraint                                          | Description                                                                                      |
| -------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| appointments         | `CHECK (ended_at > started_at)`                     | An appointment must end strictly after it starts; zero-length or reversed time ranges are rejected. |
| treatment_plans      | `CHECK (end_date IS NULL OR end_date >= start_date)`| A plan's end date may stay open (NULL); when set, it cannot fall before the start date.          |
| treatment_plan_items | `CHECK (quantity_completed >= 0)`                   | Completed-unit count can never go negative.                                                       |
| treatments           | `CHECK (price_per_unit >= 0)`                       | Unit price cannot be negative.                                                                    |
| treatments           | `CHECK (quantity > 0)`                              | A catalog service must offer at least one unit.                                                   |
| treatments           | `CHECK (total_amount >= 0)`                         | The generated total (price_per_unit \* quantity) cannot be negative.                              |
| treatments           | `CHECK (duration_minutes > 0)`                      | A service must have a positive duration.                                                          |

---

## Indexes — FUTURE IMPLEMENTATION

> Not part of the initial schema.

---

## Notes

- `appointments.therapist_id` and `client_id` are **intentionally nullable** — an appointment can exist as a request (`status = 'requested'`) before a therapist/client is assigned.
- A client may have **many** treatment plans (`treatment_plans.client_id` is not unique). A plan has many services via `treatment_plan_items`; the same service appears at most once per plan (its `UNIQUE`).
- `therapists` is a profile-extension of `users` (a therapist is a user with `role = 'therapist'`). -`treatments` is a reusable **service catalog** holding the pricing used to quote offers before a plan exists.

---

## Best practices

- **Soft-delete**: `deleted_at timestamptz` on `clients` and `therapists` (NULL = active). Pairs with the RESTRICT foreign keys — retire records instead of hard-deleting rows that have history. Filter `WHERE deleted_at IS NULL` in normal reads.
- **Auto-update `updated_at`**: keep it fresh on every UPDATE — via a DB trigger, or by setting it in the repository layer — so it never silently goes stale.
- **Case-insensitive email**: normalise to lowercase on write (or use the `citext` type) for `users.email` and `clients.email`, so `A@x.com` and `a@x.com` collide on the UNIQUE constraint.

---

## Workflow when changing the schema

1. Edit `app/database/schemas.ts` (enums first, then tables in dependency order: users, clients → therapists → treatments → treatment_plans → treatment_plan_items → appointments). Add Drizzle `relations()` for typed joins.
2. `npm run db:generate` then `npm run db:migrate`.
3. Verify in CloudBeaver (http://localhost:8978).
