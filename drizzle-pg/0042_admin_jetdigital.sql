DO $$
DECLARE
    v_user_id text;
    v_org_id text;
BEGIN
    -- 1. Insert or update admin user info@jetdigitalpro.com
    SELECT id INTO v_user_id FROM "user" WHERE email = 'info@jetdigitalpro.com';
    IF v_user_id IS NULL THEN
        v_user_id := 'usr_admin_jetdigital';
        INSERT INTO "user" (id, name, email, email_verified, role, created_at, updated_at)
        VALUES (v_user_id, 'Admin JetDigital', 'info@jetdigitalpro.com', true, 'admin', now(), now());
    ELSE
        UPDATE "user" SET role = 'admin', email_verified = true, updated_at = now() WHERE id = v_user_id;
    END IF;

    -- 2. Upsert account credential with password SeoTool.im11!
    DELETE FROM "account" WHERE user_id = v_user_id AND provider_id = 'credential';
    INSERT INTO "account" (id, account_id, provider_id, user_id, password, created_at, updated_at)
    VALUES (
        'acc_' || v_user_id,
        v_user_id,
        'credential',
        v_user_id,
        '41eebd0fa7d351ed3db0a7ad11d2cb20:9fc36cbccd4b946b89f00434843ac20a2c254e6e84131eaa4fc8158a055f3883d1875c198db1f24b3c02a3d52212f4ab2da5eb392e90433eafd997419473a276',
        now(),
        now()
    );

    -- 3. Check or create default organization
    SELECT organization_id INTO v_org_id FROM "member" WHERE user_id = v_user_id LIMIT 1;
    IF v_org_id IS NULL THEN
        v_org_id := 'org_admin_jetdigital';
        INSERT INTO "organization" (id, name, slug, created_at)
        VALUES (v_org_id, 'JetDigital Workspace', 'jetdigital-workspace', now())
        ON CONFLICT (id) DO NOTHING;

        INSERT INTO "member" (id, organization_id, user_id, role, created_at)
        VALUES ('mem_' || v_user_id, v_org_id, v_user_id, 'owner', now())
        ON CONFLICT (id) DO NOTHING;
    END IF;

    -- 4. Set subscription to agency (unlimited projects, searches, etc.)
    INSERT INTO "subscription" (organization_id, plan_tier, status, current_period_end, created_at, updated_at)
    VALUES (
        v_org_id,
        'agency',
        'active',
        '2099-12-31T23:59:59.999Z',
        to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
        to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
    )
    ON CONFLICT (organization_id) DO UPDATE SET
        plan_tier = 'agency',
        status = 'active',
        current_period_end = '2099-12-31T23:59:59.999Z',
        updated_at = to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');

    -- 5. Set unlimited monthly credits (999,999,999)
    INSERT INTO "usage_quota" (id, organization_id, feature, period, used, window_start, window_end, created_at, updated_at)
    VALUES (
        'quota_credits_' || v_org_id,
        v_org_id,
        'credits',
        'monthly',
        999999999,
        to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
        '2099-12-31T23:59:59.999Z',
        to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
        to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
    )
    ON CONFLICT (organization_id, feature, period) DO UPDATE SET
        used = 999999999,
        window_end = '2099-12-31T23:59:59.999Z',
        updated_at = to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');

    -- 6. Set unlimited topup credits (999,999,999)
    INSERT INTO "usage_quota" (id, organization_id, feature, period, used, window_start, window_end, created_at, updated_at)
    VALUES (
        'quota_topup_' || v_org_id,
        v_org_id,
        'topup_credits',
        'monthly',
        999999999,
        to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
        '2099-12-31T23:59:59.999Z',
        to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
        to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
    )
    ON CONFLICT (organization_id, feature, period) DO UPDATE SET
        used = 999999999,
        window_end = '2099-12-31T23:59:59.999Z',
        updated_at = to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
END $$;
