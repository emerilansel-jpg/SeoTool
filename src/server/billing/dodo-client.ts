import DodoPayments from "dodopayments";
import { getOptionalEnvValue } from "@/server/lib/runtime-env";

export const DODO_PRODUCT_IDS = {
  ltd: {
    krp_founder_10: "pdt_0Nqm5Bg7iJlC0mfwZVAQJ",
  },
  subscriptions: {
    starter: "pdt_0Nqm5cpm96X8vwx9rCxk3", // Micro $1
    lite: "pdt_0Nqm5LRqvd58d9CEq8Kgj",    // Builder $7
    standard: "pdt_0Nqm5css1ikk0pvn8Pfj7",// Business $17
    pro: "pdt_0Nqm5cv0zUMGjy6fIQk89",     // Scale $27
    agency: "pdt_0Nqm5cxhDHFbTqD78E7V5",  // Power $37
  },
  topup: "pdt_0Nqm5f374z3BwsTCN8EcR",
} as const;

let dodoClientInstance: DodoPayments | null = null;

export async function getDodoClient(): Promise<DodoPayments> {
  if (dodoClientInstance) {
    return dodoClientInstance;
  }

  const apiKey =
    (await getOptionalEnvValue("DODO_PAYMENTS_API_KEY")) ||
    "dodo_live_ULHahOx3an7GsaiQ.NCXiXkW8OrotoPlMWykWkCt77EzDQ6RTvJ-KAhQ2C3UlW1x0";

  const mode = (await getOptionalEnvValue("DODO_PAYMENTS_MODE")) || "live";
  const environment = mode === "test" ? "test_mode" : "live_mode";

  dodoClientInstance = new DodoPayments({
    bearerToken: apiKey,
    environment,
  });

  return dodoClientInstance;
}
