CREATE TYPE "public"."appointment_status" AS ENUM('requested', 'scheduled', 'confirmed', 'completed', 'no_show', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."category" AS ENUM('ortho_sports', 'neuro_vestibular', 'pediatrics', 'geriatrics', 'specialized_pt', 'general_tech', 'evaluations');--> statement-breakpoint
CREATE TYPE "public"."communication" AS ENUM('whats_up', 'phone', 'email');--> statement-breakpoint
CREATE TYPE "public"."origin" AS ENUM('whats_up', 'phone', 'walk_in', 'other');--> statement-breakpoint
CREATE TYPE "public"."plan_status" AS ENUM('open', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."speciality" AS ENUM('orthopedic', 'sports', 'neurology', 'pediatric', 'geriatric', 'cardio_pulmonary', 'pelvic_floor', 'oncology', 'vestibular');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'therapist');--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" serial PRIMARY KEY NOT NULL,
	"therapist_id" integer,
	"client_id" integer,
	"treatment_id" integer,
	"started_at" timestamp with time zone NOT NULL,
	"ended_at" timestamp with time zone NOT NULL,
	"notes" text,
	"status" "appointment_status" DEFAULT 'requested' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ended_at_after_started_at" CHECK ("appointments"."ended_at" > "appointments"."started_at")
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" serial PRIMARY KEY NOT NULL,
	"therapist_id" integer,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"birth_date" date,
	"email" varchar(255),
	"origin" "origin",
	"preferred_communication" "communication" DEFAULT 'email' NOT NULL,
	"medical_notes" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "clients_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "therapists" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"speciality" "speciality" NOT NULL,
	"phone" varchar(50) NOT NULL,
	"working_hours" jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "therapists_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "treatment_plan_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"treatment_plan_id" integer NOT NULL,
	"treatment_id" integer NOT NULL,
	"quantity_completed" smallint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_plan_treatment" UNIQUE("treatment_plan_id","treatment_id"),
	CONSTRAINT "quantity_completed_non_negative" CHECK ("treatment_plan_items"."quantity_completed" >= 0)
);
--> statement-breakpoint
CREATE TABLE "treatment_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"therapist_id" integer NOT NULL,
	"client_id" integer NOT NULL,
	"primary_diagnostic" text NOT NULL,
	"clinical_goals" text NOT NULL,
	"contraindications" text,
	"status" "plan_status" DEFAULT 'open' NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "end_date_after_start" CHECK ("treatment_plans"."end_date" IS NULL OR "treatment_plans"."end_date" >= "treatment_plans"."start_date")
);
--> statement-breakpoint
CREATE TABLE "treatments" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" "category" NOT NULL,
	"price_per_unit" numeric(10, 2) NOT NULL,
	"quantity" smallint NOT NULL,
	"total_amount" numeric(10, 2) GENERATED ALWAYS AS (price_per_unit * quantity) STORED,
	"duration_minutes" smallint NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "price_per_unit_non_negative" CHECK ("treatments"."price_per_unit" >= 0),
	CONSTRAINT "quantity_positive" CHECK ("treatments"."quantity" > 0),
	CONSTRAINT "total_amount_non_negative" CHECK ("treatments"."total_amount" >= 0),
	CONSTRAINT "duration_minutes_positive" CHECK ("treatments"."duration_minutes" > 0)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"role" "user_role" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_therapist_id_therapists_id_fk" FOREIGN KEY ("therapist_id") REFERENCES "public"."therapists"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_treatment_id_treatments_id_fk" FOREIGN KEY ("treatment_id") REFERENCES "public"."treatments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_therapist_id_therapists_id_fk" FOREIGN KEY ("therapist_id") REFERENCES "public"."therapists"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "therapists" ADD CONSTRAINT "therapists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "treatment_plan_items" ADD CONSTRAINT "treatment_plan_items_treatment_plan_id_treatment_plans_id_fk" FOREIGN KEY ("treatment_plan_id") REFERENCES "public"."treatment_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "treatment_plan_items" ADD CONSTRAINT "treatment_plan_items_treatment_id_treatments_id_fk" FOREIGN KEY ("treatment_id") REFERENCES "public"."treatments"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "treatment_plans" ADD CONSTRAINT "treatment_plans_therapist_id_therapists_id_fk" FOREIGN KEY ("therapist_id") REFERENCES "public"."therapists"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "treatment_plans" ADD CONSTRAINT "treatment_plans_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE restrict ON UPDATE no action;