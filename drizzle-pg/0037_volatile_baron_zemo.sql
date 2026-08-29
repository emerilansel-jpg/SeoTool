CREATE TABLE "cancellation_feedback" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"organization_id" varchar(36) NOT NULL,
	"user_id" varchar(64) NOT NULL,
	"plan_tier" varchar(50) NOT NULL,
	"reason" varchar(50) NOT NULL,
	"detail" text,
	"offer_accepted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cancellation_feedback" ADD CONSTRAINT "cancellation_feedback_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cancellation_feedback_created_idx" ON "cancellation_feedback" USING btree ("created_at");