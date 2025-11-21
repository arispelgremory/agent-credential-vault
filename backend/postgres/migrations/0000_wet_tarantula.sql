CREATE SCHEMA "main";
--> statement-breakpoint
CREATE TABLE "main"."user" (
	"user_id" varchar(40) NOT NULL,
	"user_email" varchar(100) NOT NULL,
	"user_contact_no" varchar(20) NOT NULL,
	"user_password" varchar(100) NOT NULL,
	"user_first_name" varchar(50) NOT NULL,
	"user_last_name" varchar(50) NOT NULL,
	"gender" varchar(10) NOT NULL,
	"account_id" varchar(40) NOT NULL,
	"role_id" varchar(40),
	"session_id" varchar(40),
	"status" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" varchar(40) NOT NULL,
	"updated_by" varchar(40) NOT NULL,
	CONSTRAINT "user_user_email_unique" UNIQUE("user_email"),
	CONSTRAINT "user_user_contact_no_unique" UNIQUE("user_contact_no")
);
--> statement-breakpoint
CREATE TABLE "main"."hedera_account" (
	"account_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hedera_account_id" varchar(20) NOT NULL,
	"account_name" varchar(100) NOT NULL,
	"public_key" text NOT NULL,
	"private_key" text,
	"account_type" varchar(20) NOT NULL,
	"balance" numeric(20, 2),
	"status" varchar(20) DEFAULT 'ACTIVE' NOT NULL,
	"is_operator" boolean DEFAULT false NOT NULL,
	"network" varchar(20) DEFAULT 'testnet' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" varchar(40) NOT NULL,
	"updated_by" varchar(40) NOT NULL,
	CONSTRAINT "hedera_account_hedera_account_id_unique" UNIQUE("hedera_account_id")
);
--> statement-breakpoint
CREATE TABLE "main"."topic" (
	"topic_id" varchar(100) PRIMARY KEY NOT NULL,
	"topic_name" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" varchar(40) NOT NULL,
	"updated_by" varchar(40) NOT NULL
);
