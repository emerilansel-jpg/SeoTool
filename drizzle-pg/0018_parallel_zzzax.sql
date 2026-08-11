CREATE TABLE "page_entities" (
	"id" text PRIMARY KEY NOT NULL,
	"audit_id" text NOT NULL,
	"page_id" text NOT NULL,
	"url" text NOT NULL,
	"entities_json" text DEFAULT '[]' NOT NULL,
	"topics_json" text DEFAULT '[]' NOT NULL,
	"extracted_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
ALTER TABLE "page_entities" ADD CONSTRAINT "page_entities_audit_id_audits_id_fk" FOREIGN KEY ("audit_id") REFERENCES "public"."audits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_entities" ADD CONSTRAINT "page_entities_page_id_audit_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."audit_pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "page_entities_page_id_idx" ON "page_entities" USING btree ("page_id");--> statement-breakpoint
CREATE INDEX "page_entities_audit_id_idx" ON "page_entities" USING btree ("audit_id");