CREATE TABLE "main"."agent" (
	"agent_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id_on_chain" varchar(100) NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text NOT NULL,
	"owner" varchar(100) NOT NULL,
	"registration_uri" text,
	"metadata_cid" varchar(200),
	"tx_hash" varchar(100) NOT NULL,
	"token_id" varchar(50),
	"supported_trust" text NOT NULL,
	"endpoints" text NOT NULL,
	"agent_registry" varchar(100) NOT NULL,
	"chain_id" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" varchar(40) NOT NULL,
	"updated_by" varchar(40) NOT NULL,
	CONSTRAINT "agent_agent_id_on_chain_unique" UNIQUE("agent_id_on_chain")
);
--> statement-breakpoint
CREATE TABLE "main"."mcp" (
	"mcp_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"agent_id_on_chain" varchar(100) NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text NOT NULL,
	"endpoints" text NOT NULL,
	"status" varchar(20) DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" varchar(40) NOT NULL,
	"updated_by" varchar(40) NOT NULL
);
