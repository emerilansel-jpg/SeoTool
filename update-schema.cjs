const fs = require('fs');

const sqliteAppSchema = fs.readFileSync('src/db/app.schema.ts', 'utf8');
const pgAppSchema = fs.readFileSync('src/db/pg/app.schema.ts', 'utf8');

const sqliteGmbTables = `
export const gmbGridConfigs = sqliteTable(
  "gmb_grid_configs",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    businessName: text("business_name").notNull(),
    placeId: text("place_id"),
    keyword: text("keyword").notNull(),
    centerLat: real("center_lat").notNull(),
    centerLng: real("center_lng").notNull(),
    gridSize: integer("grid_size").notNull(),
    radiusMeters: integer("radius_meters").notNull(),
    scheduleInterval: text("schedule_interval", { enum: ["weekly", "monthly", "manual"] })
      .notNull()
      .default("weekly"),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: text("created_at")
      .notNull()
      .default(sql\`(current_timestamp)\`),
  }
);

export const gmbGridRuns = sqliteTable("gmb_grid_runs", {
  id: text("id").primaryKey(),
  configId: text("config_id")
    .notNull()
    .references(() => gmbGridConfigs.id, { onDelete: "cascade" }),
  status: text("status", { enum: ["pending", "running", "completed", "failed"] })
    .notNull()
    .default("pending"),
  startedAt: text("started_at")
    .notNull()
    .default(sql\`(current_timestamp)\`),
  completedAt: text("completed_at"),
});

export const gmbGridSnapshots = sqliteTable(
  "gmb_grid_snapshots",
  {
    id: text("id").primaryKey(),
    runId: text("run_id")
      .notNull()
      .references(() => gmbGridRuns.id, { onDelete: "cascade" }),
    lat: real("lat").notNull(),
    lng: real("lng").notNull(),
    gridRow: integer("grid_row").notNull(),
    gridCol: integer("grid_col").notNull(),
    rank: integer("rank"),
    taskId: text("task_id"),
    status: text("status", { enum: ["pending", "completed", "failed"] })
      .notNull()
      .default("pending"),
  }
);
`;

const pgGmbTables = `
export const gmbGridConfigs = pgTable(
  "gmb_grid_configs",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    businessName: text("business_name").notNull(),
    placeId: text("place_id"),
    keyword: text("keyword").notNull(),
    centerLat: real("center_lat").notNull(),
    centerLng: real("center_lng").notNull(),
    gridSize: integer("grid_size").notNull(),
    radiusMeters: integer("radius_meters").notNull(),
    scheduleInterval: text("schedule_interval", { enum: ["weekly", "monthly", "manual"] })
      .notNull()
      .default("weekly"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: text("created_at")
      .notNull()
      .default(sql\`(isoNow())\`),
  }
);

export const gmbGridRuns = pgTable("gmb_grid_runs", {
  id: text("id").primaryKey(),
  configId: text("config_id")
    .notNull()
    .references(() => gmbGridConfigs.id, { onDelete: "cascade" }),
  status: text("status", { enum: ["pending", "running", "completed", "failed"] })
    .notNull()
    .default("pending"),
  startedAt: text("started_at")
    .notNull()
    .default(sql\`(isoNow())\`),
  completedAt: text("completed_at"),
});

export const gmbGridSnapshots = pgTable(
  "gmb_grid_snapshots",
  {
    id: text("id").primaryKey(),
    runId: text("run_id")
      .notNull()
      .references(() => gmbGridRuns.id, { onDelete: "cascade" }),
    lat: real("lat").notNull(),
    lng: real("lng").notNull(),
    gridRow: integer("grid_row").notNull(),
    gridCol: integer("grid_col").notNull(),
    rank: integer("rank"),
    taskId: text("task_id"),
    status: text("status", { enum: ["pending", "completed", "failed"] })
      .notNull()
      .default("pending"),
  }
);
`;

fs.writeFileSync('src/db/app.schema.ts', sqliteAppSchema + '\n' + sqliteGmbTables);
fs.writeFileSync('src/db/pg/app.schema.ts', pgAppSchema + '\n' + pgGmbTables);
console.log("Schema updated.");
