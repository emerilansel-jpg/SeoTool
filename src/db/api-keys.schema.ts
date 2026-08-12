// Re-export from the D1/SQLite definition so the provider-aware barrel
// (./schema.ts) can import it alongside the other top-level SQLite schemas.
export { apiKeys } from "./d1/api-keys.schema";
