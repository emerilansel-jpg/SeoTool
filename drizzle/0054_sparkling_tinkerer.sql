CREATE TABLE \`gmb_grid_configs\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`project_id\` text NOT NULL,
	\`business_name\` text NOT NULL,
	\`place_id\` text,
	\`keyword\` text NOT NULL,
	\`center_lat\` real NOT NULL,
	\`center_lng\` real NOT NULL,
	\`grid_size\` integer NOT NULL,
	\`radius_meters\` integer NOT NULL,
	\`schedule_interval\` text DEFAULT 'weekly' NOT NULL,
	\`is_active\` integer DEFAULT true NOT NULL,
	\`created_at\` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (\`project_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE \`gmb_grid_runs\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`config_id\` text NOT NULL,
	\`status\` text DEFAULT 'pending' NOT NULL,
	\`started_at\` text DEFAULT (current_timestamp) NOT NULL,
	\`completed_at\` text,
	FOREIGN KEY (\`config_id\`) REFERENCES \`gmb_grid_configs\`(\`id\`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE \`gmb_grid_snapshots\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`run_id\` text NOT NULL,
	\`lat\` real NOT NULL,
	\`lng\` real NOT NULL,
	\`grid_row\` integer NOT NULL,
	\`grid_col\` integer NOT NULL,
	\`rank\` integer,
	\`task_id\` text,
	\`status\` text DEFAULT 'pending' NOT NULL,
	FOREIGN KEY (\`run_id\`) REFERENCES \`gmb_grid_runs\`(\`id\`) ON UPDATE no action ON DELETE cascade
);
