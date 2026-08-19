-- Better Auth twoFactor plugin: user flag + secret store
ALTER TABLE "user" ADD COLUMN "two_factor_enabled" boolean;--> statement-breakpoint

CREATE TABLE "twoFactor" (
	"id" text PRIMARY KEY NOT NULL,
	"secret" text NOT NULL,
	"backup_codes" text NOT NULL,
	"user_id" text NOT NULL,
	"verified" boolean DEFAULT true NOT NULL,
	"failed_verification_count" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp with time zone,
	CONSTRAINT "twoFactor_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action
);--> statement-breakpoint
CREATE INDEX "twoFactor_secret_idx" ON "twoFactor" USING btree ("secret");--> statement-breakpoint
CREATE INDEX "twoFactor_userId_idx" ON "twoFactor" USING btree ("user_id");
