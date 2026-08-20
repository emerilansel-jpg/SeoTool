// Re-export from the D1/SQLite definition so the provider-aware barrel
// (./schema.ts) can import it alongside the other top-level SQLite schemas.
export {
  appSettings,
  cmsPages,
  cmsPosts,
  paypalWebhookEvents,
  planConfig,
} from "./d1/admin.schema";
