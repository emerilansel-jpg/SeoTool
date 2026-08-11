CREATE TABLE "serp_snapshots" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"run_id" varchar(36) NOT NULL,
	"tracking_keyword_id" text NOT NULL,
	"keyword" text NOT NULL,
	"device" varchar(20) NOT NULL,
	"rank" integer NOT NULL,
	"url" text,
	"title" text,
	"description" text,
	"domain" text,
	"is_tracked_domain" boolean DEFAULT false NOT NULL,
	"checked_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "serp_snapshots" ADD CONSTRAINT "serp_snapshots_run_id_rank_check_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."rank_check_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "serp_snapshots_run_kw_device_idx" ON "serp_snapshots" USING btree ("run_id","tracking_keyword_id","device");--> statement-breakpoint
CREATE INDEX "serp_snapshots_kw_rank_idx" ON "serp_snapshots" USING btree ("tracking_keyword_id","rank");--> statement-breakpoint
CREATE UNIQUE INDEX "serp_snapshots_unique_idx" ON "serp_snapshots" USING btree ("run_id","tracking_keyword_id","device","rank");