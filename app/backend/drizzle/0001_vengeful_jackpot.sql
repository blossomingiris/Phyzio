ALTER TABLE "therapists" DROP CONSTRAINT "therapists_user_id_unique";--> statement-breakpoint
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_therapist_id_therapists_id_fk";
--> statement-breakpoint
ALTER TABLE "clients" DROP CONSTRAINT "clients_therapist_id_therapists_id_fk";
--> statement-breakpoint
ALTER TABLE "treatment_plans" DROP CONSTRAINT "treatment_plans_therapist_id_therapists_id_fk";
--> statement-breakpoint
ALTER TABLE "therapists" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "therapists" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "therapists" ADD PRIMARY KEY ("user_id");--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_therapist_id_therapists_user_id_fk" FOREIGN KEY ("therapist_id") REFERENCES "public"."therapists"("user_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_therapist_id_therapists_user_id_fk" FOREIGN KEY ("therapist_id") REFERENCES "public"."therapists"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "treatment_plans" ADD CONSTRAINT "treatment_plans_therapist_id_therapists_user_id_fk" FOREIGN KEY ("therapist_id") REFERENCES "public"."therapists"("user_id") ON DELETE restrict ON UPDATE no action;
