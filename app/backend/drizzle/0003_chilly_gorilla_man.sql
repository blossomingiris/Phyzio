CREATE TYPE "public"."cancellation_reason" AS ENUM('client_request', 'client_unreachable', 'therapist_unavailable', 'other');--> statement-breakpoint
CREATE TYPE "public"."plan_cancellation_reason" AS ENUM('client_request', 'client_unreachable', 'therapist_referral', 'other');--> statement-breakpoint
ALTER TYPE "public"."plan_status" ADD VALUE 'paused' BEFORE 'completed';--> statement-breakpoint
ALTER TABLE "appointments" RENAME COLUMN "treatment_id" TO "treatment_plan_id";--> statement-breakpoint
ALTER TABLE "appointments" DROP CONSTRAINT "ended_at_after_started_at";--> statement-breakpoint
ALTER TABLE "treatment_plan_items" DROP CONSTRAINT "quantity_completed_non_negative";--> statement-breakpoint
ALTER TABLE "treatment_plans" DROP CONSTRAINT "end_date_after_start";--> statement-breakpoint
ALTER TABLE "treatments" DROP CONSTRAINT "price_per_unit_non_negative";--> statement-breakpoint
ALTER TABLE "treatments" DROP CONSTRAINT "quantity_positive";--> statement-breakpoint
ALTER TABLE "treatments" DROP CONSTRAINT "total_amount_non_negative";--> statement-breakpoint
ALTER TABLE "treatments" DROP CONSTRAINT "duration_minutes_positive";--> statement-breakpoint
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_treatment_id_treatments_id_fk";
--> statement-breakpoint
ALTER TABLE "appointments" ALTER COLUMN "client_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "cancellation_reason" "cancellation_reason";--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "cancellation_note" text;--> statement-breakpoint
ALTER TABLE "treatment_plans" ADD COLUMN "cancellation_reason" "plan_cancellation_reason";--> statement-breakpoint
ALTER TABLE "treatment_plans" ADD COLUMN "cancellation_note" text;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_treatment_plan_id_treatment_plans_id_fk" FOREIGN KEY ("treatment_plan_id") REFERENCES "public"."treatment_plans"("id") ON DELETE set null ON UPDATE no action;