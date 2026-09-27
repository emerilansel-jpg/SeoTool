ALTER TABLE "cms_posts" ADD COLUMN IF NOT EXISTS "featured_image" text;--> statement-breakpoint
ALTER TABLE "cms_posts" ADD COLUMN IF NOT EXISTS "meta_title" text;--> statement-breakpoint
ALTER TABLE "cms_posts" ADD COLUMN IF NOT EXISTS "meta_description" text;--> statement-breakpoint
ALTER TABLE "cms_posts" ADD COLUMN IF NOT EXISTS "schema_json" text;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cms_images" (
	"id" text PRIMARY KEY NOT NULL,
	"filename" text NOT NULL,
	"mime_type" text NOT NULL,
	"data_base64" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"created_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
