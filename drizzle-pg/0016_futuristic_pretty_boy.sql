CREATE TABLE "content_scores" (
	"id" text PRIMARY KEY NOT NULL,
	"audit_id" text NOT NULL,
	"page_id" text NOT NULL,
	"url" text NOT NULL,
	"score" integer NOT NULL,
	"depth_score" integer NOT NULL,
	"headings_score" integer NOT NULL,
	"metadata_score" integer NOT NULL,
	"media_score" integer NOT NULL,
	"linking_score" integer NOT NULL,
	"technical_score" integer NOT NULL,
	"flags_json" text DEFAULT '[]' NOT NULL,
	"word_count" integer DEFAULT 0 NOT NULL,
	"computed_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
ALTER TABLE "content_scores" ADD CONSTRAINT "content_scores_audit_id_audits_id_fk" FOREIGN KEY ("audit_id") REFERENCES "public"."audits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_scores" ADD CONSTRAINT "content_scores_page_id_audit_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."audit_pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "content_scores_page_id_idx" ON "content_scores" USING btree ("page_id");--> statement-breakpoint
CREATE INDEX "content_scores_audit_id_idx" ON "content_scores" USING btree ("audit_id");