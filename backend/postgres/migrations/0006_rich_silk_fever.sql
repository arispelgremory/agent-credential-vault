CREATE TABLE "main"."credential" (
	"credential_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(40) NOT NULL,
	"credential_type" varchar(50) NOT NULL,
	"credential_data" jsonb NOT NULL,
	"status" varchar(20) DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" varchar(40) NOT NULL,
	"updated_by" varchar(40) NOT NULL
);
