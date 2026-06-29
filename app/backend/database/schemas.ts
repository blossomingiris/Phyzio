import { relations, sql } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  serial,
  smallint,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";

// --- Types ---

type TimeSlot = { start: string; end: string };
export type WorkingHours = {
  mon?: TimeSlot[];
  tue?: TimeSlot[];
  wed?: TimeSlot[];
  thu?: TimeSlot[];
  fri?: TimeSlot[];
  sat?: TimeSlot[];
  sun?: TimeSlot[];
};

// --- Enums ---

export const userRoleEnum = pgEnum("user_role", ["admin", "therapist"]);

export const specialityEnum = pgEnum("speciality", [
  "orthopedic",
  "sports",
  "neurology",
  "pediatric",
  "geriatric",
  "cardio_pulmonary",
  "pelvic_floor",
  "oncology",
  "vestibular",
]);

export const originEnum = pgEnum("origin", [
  "whats_up",
  "phone",
  "walk_in",
  "other",
]);

export const communicationEnum = pgEnum("communication", [
  "whats_up",
  "phone",
  "email",
]);

export const categoryEnum = pgEnum("category", [
  "ortho_sports",
  "neuro_vestibular",
  "pediatrics",
  "geriatrics",
  "specialized_pt",
  "general_tech",
  "evaluations",
]);

export const planStatusEnum = pgEnum("plan_status", [
  "open",
  "in_progress",
  "paused",
  "completed",
  "cancelled",
]);

export const planCancellationReasonEnum = pgEnum("plan_cancellation_reason", [
  "client_request",
  "client_unreachable",
  "therapist_referral",
  "other",
]);

export const appointmentStatusEnum = pgEnum("appointment_status", [
  "requested",
  "scheduled",
  "confirmed",
  "completed",
  "no_show",
  "cancelled",
]);

export const cancellationReasonEnum = pgEnum("cancellation_reason", [
  "client_request",
  "client_unreachable",
  "therapist_unavailable",
  "other",
]);

// --- Tables ---

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: userRoleEnum("role").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const therapists = pgTable("therapists", {
  userId: integer("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  speciality: specialityEnum("speciality").notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  workingHours: jsonb("working_hours").$type<WorkingHours>().notNull(),
  isActive: boolean("is_active").notNull().default(true),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  therapistId: integer("therapist_id").references(() => therapists.userId, {
    onDelete: "set null",
  }),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  birthDate: date("birth_date"),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }).unique(),
  origin: originEnum("origin"),
  preferredCommunication: communicationEnum("preferred_communication")
    .notNull()
    .default("email"),
  medicalNotes: text("medical_notes"),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const treatments = pgTable(
  "treatments",
  {
    id: serial("id").primaryKey(),
    category: categoryEnum("category").notNull(),
    pricePerUnit: numeric("price_per_unit", {
      precision: 10,
      scale: 2,
    }).notNull(),
    quantity: smallint("quantity").notNull(),
    totalAmount: numeric("total_amount", {
      precision: 10,
      scale: 2,
    }).generatedAlwaysAs(sql`price_per_unit * quantity`),
    durationMinutes: smallint("duration_minutes").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
);

export const treatmentPlans = pgTable(
  "treatment_plans",
  {
    id: serial("id").primaryKey(),
    therapistId: integer("therapist_id")
      .notNull()
      .references(() => therapists.userId, { onDelete: "restrict" }),
    clientId: integer("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "restrict" }),
    primaryDiagnostic: text("primary_diagnostic").notNull(),
    clinicalGoals: text("clinical_goals").notNull(),
    contraindications: text("contraindications"),
    status: planStatusEnum("status").notNull().default("open"),
    cancellationReason: planCancellationReasonEnum("cancellation_reason"),
    cancellationNote: text("cancellation_note"),
    startDate: timestamp("start_date", { withTimezone: true }).notNull(),
    endDate: timestamp("end_date", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  () => [],
);

export const treatmentPlanItems = pgTable(
  "treatment_plan_items",
  {
    id: serial("id").primaryKey(),
    treatmentPlanId: integer("treatment_plan_id")
      .notNull()
      .references(() => treatmentPlans.id, { onDelete: "cascade" }),
    treatmentId: integer("treatment_id")
      .notNull()
      .references(() => treatments.id, { onDelete: "restrict" }),
    quantityCompleted: smallint("quantity_completed").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("uq_plan_treatment").on(table.treatmentPlanId, table.treatmentId),
  ],
);

export const appointments = pgTable(
  "appointments",
  {
    id: serial("id").primaryKey(),
    therapistId: integer("therapist_id").references(() => therapists.userId, {
      onDelete: "restrict",
    }),
    clientId: integer("client_id")
      .notNull()
      .references(() => clients.id, {
        onDelete: "restrict",
      }),
    treatmentPlanId: integer("treatment_plan_id").references(
      () => treatmentPlans.id,
      { onDelete: "set null" },
    ),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    endedAt: timestamp("ended_at", { withTimezone: true }).notNull(),
    notes: text("notes"),
    status: appointmentStatusEnum("status").notNull().default("requested"),
    cancellationReason: cancellationReasonEnum("cancellation_reason"),
    cancellationNote: text("cancellation_note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  () => [],
);

// --- Relations ---

export const usersRelations = relations(users, ({ one }) => ({
  therapist: one(therapists, {
    fields: [users.id],
    references: [therapists.userId],
  }),
}));

export const therapistsRelations = relations(therapists, ({ one, many }) => ({
  user: one(users, {
    fields: [therapists.userId],
    references: [users.id],
  }),
  clients: many(clients),
  treatmentPlans: many(treatmentPlans),
  appointments: many(appointments),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  therapist: one(therapists, {
    fields: [clients.therapistId],
    references: [therapists.userId],
  }),
  treatmentPlans: many(treatmentPlans),
  appointments: many(appointments),
}));

export const treatmentsRelations = relations(treatments, ({ many }) => ({
  treatmentPlanItems: many(treatmentPlanItems),
}));

export const treatmentPlansRelations = relations(
  treatmentPlans,
  ({ one, many }) => ({
    therapist: one(therapists, {
      fields: [treatmentPlans.therapistId],
      references: [therapists.userId],
    }),
    client: one(clients, {
      fields: [treatmentPlans.clientId],
      references: [clients.id],
    }),
    items: many(treatmentPlanItems),
    appointments: many(appointments),
  }),
);

export const treatmentPlanItemsRelations = relations(
  treatmentPlanItems,
  ({ one }) => ({
    treatmentPlan: one(treatmentPlans, {
      fields: [treatmentPlanItems.treatmentPlanId],
      references: [treatmentPlans.id],
    }),
    treatment: one(treatments, {
      fields: [treatmentPlanItems.treatmentId],
      references: [treatments.id],
    }),
  }),
);

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  therapist: one(therapists, {
    fields: [appointments.therapistId],
    references: [therapists.userId],
  }),
  client: one(clients, {
    fields: [appointments.clientId],
    references: [clients.id],
  }),
  treatmentPlan: one(treatmentPlans, {
    fields: [appointments.treatmentPlanId],
    references: [treatmentPlans.id],
  }),
}));
