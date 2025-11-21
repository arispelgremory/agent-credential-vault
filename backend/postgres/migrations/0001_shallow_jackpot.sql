ALTER TABLE "main"."user" ADD COLUMN "kyc_status" varchar(20);--> statement-breakpoint
ALTER TABLE "main"."user" ADD COLUMN "kyc_submitted_at" timestamp;--> statement-breakpoint
ALTER TABLE "main"."user" ADD COLUMN "is_authenticated" boolean;