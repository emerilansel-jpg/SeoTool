# PayPal Billing Configuration

This document describes how to configure PayPal Billing Plans for SeoTool.im's
tiered billing system.

## Overview

SeoTool.im uses four plan tiers, each mapped to a PayPal Billing Plan:

| Tier   | Price/mo | PayPal Plan ID    | Description                   |
| ------ | -------- | ----------------- | ----------------------------- |
| Free   | $0       | (no subscription) | Default, attached at signup   |
| Lite   | $49      | `lite-plan`       | Solo / small business         |
| Pro    | $149     | `pro-plan`        | Professional / growing agency |
| Agency | $499     | `agency-plan`     | Large agency / enterprise     |

## Setup in PayPal Developer Dashboard

### 1. Create Products

For each paid tier, create a **Product** in the PayPal dashboard:

1. Go to https://developer.paypal.com/dashboard/applications
2. Navigate to **Products** > **Subscriptions** > **Create Product**
3. Create three products:
   - **SeoTool Lite** (ID: auto-generated)
   - **SeoTool Pro** (ID: auto-generated)
   - **SeoTool Agency** (ID: auto-generated)
4. Category: Software
5. Type: Service

### 2. Create Billing Plans

For each product, create a **Billing Plan**:

1. Go to **Subscriptions** > **Plans** > **Create Plan**
2. For each tier:
   - Select the product created above
   - Plan ID: `lite-plan`, `pro-plan`, `agency-plan` (must match `PAYPAL_PLAN_IDS` in `src/shared/plans.ts`)
   - Billing cycle: Monthly
   - Price: $49 / $149 / $499
   - Currency: USD
   - Auto-bill outstanding: Yes
   - Payment failure threshold: 3

### 3. Create Webhook

1. Go to **Webhooks** > **Create Webhook**
2. Endpoint URL: `https://yourdomain.com/api/paypal/webhook`
3. Events to subscribe to:
   - `BILLING.SUBSCRIPTION.CREATED`
   - `BILLING.SUBSCRIPTION.UPDATED`
   - `BILLING.SUBSCRIPTION.CANCELLED`
   - `BILLING.SUBSCRIPTION.EXPIRED`
   - `BILLING.SUBSCRIPTION.ACTIVATED`
   - `BILLING.SUBSCRIPTION.SUSPENDED`
   - `PAYMENT.CAPTURE.COMPLETED`
4. Save the **Webhook ID** — set it as `PAYPAL_WEBHOOK_ID` in your env

### 4. Environment Variables

Set these in `.env.hosted`:

```bash
PAYPAL_CLIENT_ID=your-client-id
PAYPAL_CLIENT_SECRET=your-client-secret
PAYPAL_MODE=sandbox  # or "live" for production
PAYPAL_WEBHOOK_ID=your-webhook-id
```

## Plan ID Mapping

The plan IDs are defined in `src/shared/plans.ts`:

```typescript
export const PAYPAL_PLAN_IDS: Record<PlanTier, string | null> = {
  free: null, // No subscription needed
  lite: "lite-plan",
  pro: "pro-plan",
  agency: "agency-plan",
};
```

## Credits System

PayPal does not have a native credits/balance system. Credits are managed
locally using the `usage_quota` database table:

- **Monthly credits**: Granted per tier on plan creation/renewal
  - Free: 100 credits
  - Lite: 5,000 credits
  - Pro: 25,000 credits
  - Agency: 100,000 credits
- **Top-up credits**: Purchased one-time, roll over until exhausted
- **Usage tracking**: Deducted via `deductCredits()` in `src/server/billing/credits.ts`

## Webhook Flow

1. User approves subscription on PayPal
2. PayPal fires `BILLING.SUBSCRIPTION.CREATED` to `/api/paypal/webhook`
3. Webhook handler verifies signature via PayPal's verify API
4. `syncPaypalCustomerStatus()` fetches subscription, updates local DB
5. Plan tier changes trigger quota resets and credit grants
6. Loops CRM is synced with billing status

## Customer Portal

PayPal's customer portal is accessed via the subscription revision URL:

```
POST /v1/billing/subscriptions/{id}/revise
```

This redirects the user to PayPal's hosted billing management page where they
can:

- Update payment method
- Cancel subscription
- View invoices
