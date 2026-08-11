CREATE TABLE "content_briefs" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"project_id" varchar(36) NOT NULL,
	"cluster_id" varchar(36),
	"target_keyword" text NOT NULL,
	"title" text,
	"status" varchar(50) DEFAULT 'idea' NOT NULL,
	"priority_score" integer,
	"target_url" text,
	"brief_data_json" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "topic_clusters" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"project_id" varchar(36) NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"pillar_page_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "content_briefs" ADD CONSTRAINT "content_briefs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_briefs" ADD CONSTRAINT "content_briefs_cluster_id_topic_clusters_id_fk" FOREIGN KEY ("cluster_id") REFERENCES "public"."topic_clusters"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topic_clusters" ADD CONSTRAINT "topic_clusters_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "content_briefs_project_id_idx" ON "content_briefs" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "content_briefs_cluster_id_idx" ON "content_briefs" USING btree ("cluster_id");--> statement-breakpoint
CREATE INDEX "content_briefs_status_idx" ON "content_briefs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "topic_clusters_project_id_idx" ON "topic_clusters" USING btree ("project_id");