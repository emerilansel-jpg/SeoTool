-- Keep the deterministic auth-bypass identity backed by valid Better Auth
-- rows. This lets server functions exercise real foreign keys during E2E
-- runs instead of silently logging constraint failures for e2e-org-id.
DELETE FROM "member"
WHERE "organization_id" = 'e2e-org-id' OR "user_id" = 'e2e-user-id';

DELETE FROM "organization" WHERE "id" = 'e2e-org-id';
DELETE FROM "user" WHERE "id" = 'e2e-user-id';

INSERT INTO "user" (
  "id",
  "name",
  "email",
  "email_verified",
  "created_at",
  "updated_at"
) VALUES (
  'e2e-user-id',
  'E2E Test User',
  'e2e@test.local',
  1,
  cast(unixepoch('subsecond') * 1000 as integer),
  cast(unixepoch('subsecond') * 1000 as integer)
);

INSERT INTO "organization" (
  "id",
  "name",
  "slug",
  "created_at"
) VALUES (
  'e2e-org-id',
  'E2E Test Organization',
  'e2e-test-organization',
  cast(unixepoch('subsecond') * 1000 as integer)
);

INSERT INTO "member" (
  "id",
  "organization_id",
  "user_id",
  "role",
  "created_at"
) VALUES (
  'e2e-member-id',
  'e2e-org-id',
  'e2e-user-id',
  'owner',
  cast(unixepoch('subsecond') * 1000 as integer)
);
