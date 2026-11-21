ALTER TABLE "gmb_grid_configs" ADD COLUMN "shape" text DEFAULT 'square' NOT NULL;--> statement-breakpoint
ALTER TABLE "gmb_grid_configs" ADD COLUMN "polygon_latlngs" text;