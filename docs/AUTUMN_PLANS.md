# Autumn Plan Configuration

This document describes how to configure the four plan tiers in the Autumn
dashboard to work with OpenSEO's tiered billing system.

## Overview

OpenSEO uses four plan tiers, each mapped to an Autumn product/plan:

| Tier   | Price/mo | Autumn Plan ID   | Description                   |
| ------ | -------- | ---------------- | ----------------------------- |
| Free   | $0       | (Autumn Default) | Default, attached at signup   |
| Lite   | $49      | `lite-plan`      | Solo / small business         |
| Pro    | $149     | `pro-plan`       | Professional / growing agency |
| Agency | $499     | `agency-plan`    | Large agency / enterprise     |

## Setup in Autumn Dashboard

### 1. Free Tier (Default)

The free tier is the Autumn **Default** plan — it's automatically attached to
every customer at creation. No explicit plan configuration is needed.

In `src/shared/plans.ts`, the free tier maps to `AUTUMN_PLAN_IDS.free = null`.

### 2. Create Lite, Pro, Agency Plans

For each paid tier, create a plan in the Autumn dashboard with:

- **Plan ID**: `lite-plan`, `pro-plan`, `agency-plan` (must match `AUTUMN_PLAN_IDS` in `src/shared/plans.ts`)
- **Price**: $49/mo, $149/mo, $499/mo respectively
- **Billing interval**: Monthly recurring

### 3. Feature Entitlements (Optional)

Each plan can optionally carry Autumn feature entitlements for metered
reporting (the enforcement is handled locally by QuotaService, not Autumn):

| Feature ID               | Free | Lite | Pro | Agency |
| ------------------------ | ---- | ---- | --- | ------ |
| `managed_service_access` | ✓    | ✓    | ✓   | ✓      |
| `usage_credits`          | —    | —    | —   | —      |
| `topup_credits`          | —    | —    | —   | —      |

The `managed_service_access` feature is granted by the Default (free) plan so
every user can access the managed service at all.

## Webhook Events

The webhook handler at `/api/autumn/webhook` processes these events:

| Event                   | Action                                         |
| ----------------------- | ---------------------------------------------- |
| `billing.updated`       | Re-sync customer status + subscription table   |
| `subscription.created`  | Re-sync — new paid subscription                |
| `subscription.updated`  | Re-sync — plan upgrade/downgrade + quota reset |
| `subscription.canceled` | Re-sync — downgrade to free tier               |

All events converge on `syncAutumnCustomerStatus()`, which:

1. Reads the full customer from Autumn
2. Derives the plan tier from the active subscription
3. Upserts the `billing_customer_status` table
4. Upserts the `subscription` table with the resolved tier
5. **Resets windowed quotas** if the tier changed (so upgrades start fresh)
6. Syncs billing status to Loops (email)

## Plan Tier Resolution

The `planTierFromAutumnPlanId()` function in `src/shared/plans.ts` maps Autumn
plan IDs to internal tiers:

```
lite-plan   → lite
pro-plan    → pro
agency-plan → agency
(null/other) → free
```

The `customer-status-model.ts` selects the highest active tiered subscription
from the customer's subscription list, preferring `status: "active"` over
other statuses (scheduled, trialing, past_due).

## Credit Pool (Legacy → Overage)

The legacy `usage_credits` / `topup_credits` credit pool is retained as an
**overage mechanism**: users who exhaust their per-feature quotas can purchase
top-up credits that draw from the same pool. This is handled by the existing
`trackUsageCreditSpend()` flow and is independent of the quota system.

The primary enforcement is now **per-feature quotas** (daily/monthly/gauge),
not the credit pool. Credits remain useful for:

- Metered cost tracking and analytics
- Optional overage when quotas are exceeded
- The top-up flow as a fallback

## Changing Plan Limits

To change a tier's limits, edit `PLAN_LIMITS` in `src/shared/plans.ts`. The
change takes effect immediately for all users on that tier — no migration
needed. The marketing pricing page and in-app billing page read from the same
source, so they stay in sync automatically.
