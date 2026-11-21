CREATE TABLE "gbp_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"keyword" text NOT NULL,
	"location_code" integer DEFAULT 2840 NOT NULL,
	"language_code" text DEFAULT 'en' NOT NULL,
	"profile_json" text,
	"fetched_at" text,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gbp_reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"review_id" text NOT NULL,
	"author" text,
	"rating" integer,
	"text" text,
	"owner_answer" text,
	"reviewed_at" text,
	"fetched_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nap_audits" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"business_name" text NOT NULL,
	"city" text NOT NULL,
	"phone" text,
	"address" text,
	"location_code" integer DEFAULT 2840 NOT NULL,
	"language_code" text DEFAULT 'en' NOT NULL,
	"consistency_score" integer,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nap_results" (
	"id" text PRIMARY KEY NOT NULL,
	"audit_id" text NOT NULL,
	"project_id" text NOT NULL,
	"directory" text NOT NULL,
	"status" text NOT NULL,
	"source_url" text,
	"found_name" text,
	"found_phone" text,
	"found_address" text,
	"rating_value" real,
	"rating_count" integer,
	"detail" text
);
--> statement-breakpoint
ALTER TABLE "gbp_profiles" ADD CONSTRAINT "gbp_profiles_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gbp_profiles" ADD CONSTRAINT "gbp_profiles_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gbp_reviews" ADD CONSTRAINT "gbp_reviews_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gbp_reviews" ADD CONSTRAINT "gbp_reviews_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nap_audits" ADD CONSTRAINT "nap_audits_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nap_audits" ADD CONSTRAINT "nap_audits_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nap_results" ADD CONSTRAINT "nap_results_audit_id_nap_audits_id_fk" FOREIGN KEY ("audit_id") REFERENCES "public"."nap_audits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nap_results" ADD CONSTRAINT "nap_results_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "gbp_profiles_project_idx" ON "gbp_profiles" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "gbp_profiles_organization_idx" ON "gbp_profiles" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "gbp_reviews_project_review_idx" ON "gbp_reviews" USING btree ("project_id","review_id");--> statement-breakpoint
CREATE INDEX "gbp_reviews_project_idx" ON "gbp_reviews" USING btree ("project_id","reviewed_at");--> statement-breakpoint
CREATE INDEX "nap_audits_project_idx" ON "nap_audits" USING btree ("project_id","created_at");--> statement-breakpoint
CREATE INDEX "nap_audits_organization_idx" ON "nap_audits" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "nap_results_audit_idx" ON "nap_results" USING btree ("audit_id");--> statement-breakpoint
CREATE INDEX "nap_results_project_idx" ON "nap_results" USING btree ("project_id");