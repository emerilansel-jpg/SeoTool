// oxlint-disable max-lines
import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Key, Lock, Sparkles, Users, Zap } from "lucide-react";
import {
  MarketingChrome,
  useMarketingSession,
} from "@/client/features/marketing/MarketingChrome";
import { getPublicCohortPricing } from "@/serverFunctions/public-cohorts";
import type { EffectiveKeywordProCohort } from "@/server/features/keywords/services/KeywordProConfigService";
import { CreditPricingGuide } from "@/client/features/billing/CreditPricingGuide";

const FAQ_ITEMS = [
  {
    question: "Apa itu Lifetime Deal (LTD) & sistem naik $10?",
    answer:
      "LTD adalah sistem bayar cuma satu kali untuk mendapatkan akses seumur hidup ke platform SeoTool.im. Kami memberi reward kepada pendukung awal (early believers) dengan harga progresif yang naik $10 setiap kali kuota batch (cohort) penuh: Founder 10 ($29), Early 20 ($39), Growth 50 ($49), dan Public ($59). Begitu Anda membeli, Anda tidak akan pernah ditagih biaya langganan bulanan lagi.",
  },
  {
    question: "Bagaimana cara kerja BYOK (Bring Your Own Key)?",
    answer:
      "BYOK berarti Anda memasukkan API key DataForSEO dan OpenRouter/OpenAI/Claude milik Anda sendiri di dashboard. Kami tidak mengambil markup sepeser pun dari biaya query data SEO dan token AI Anda. Anda hanya membayar biaya mentah langsung ke provider ($0.002 per scan), sehingga Anda bisa melakukan crawling dan audit berskala enterprise tanpa batasan kuota.",
  },
  {
    question: "Bagaimana dengan AppSumo Lifetime Deals?",
    answer:
      "Bagi pengguna yang ingin limit instan yang lebih tinggi, multi-domain, dan multi-seat tanpa repot, kami menyediakan 5 Tier resmi AppSumo mulai dari $37 hingga $399 (one-time payment). Tier 3 ($149) merupakan pilihan paling populer yang sudah dilengkapi fitur White-label PDF dan export CSV.",
  },
  {
    question: "Bagaimana cara kerja $1 Credit Retainer?",
    answer:
      "Jika Anda ingin komitmen paling ringan tanpa membeli LTD, Anda bisa mulai dari $1/bulan. 100% uang Anda dikonversi menjadi kredit pemakaian permanen (1.000 kredit per dollar) yang dapat diakumulasi (roll over) dan tidak pernah hangus selamanya, bahkan jika Anda berhenti berlangganan.",
  },
  {
    question: "Apakah ada garansi uang kembali?",
    answer:
      "Ya. Semua transaksi dilindungi oleh garansi uang kembali 30 hari penuh tanpa risiko. Jika tools kami tidak sesuai dengan kebutuhan Anda, cukup hubungi support untuk pengembalian dana 100%.",
  },
] as const;

const APPSUMO_TIERS = [
  {
    tier: 1,
    key: "appsumo_tier_1",
    name: "Tier 1",
    price: 37,
    target: "Solopreneur / Blogger",
    domains: "1 Domain · 1 Seat",
    limits: "150 AI checks/bln · 250 hal audit · 50 SERP kw",
    bullets: [
      "1 Domain & 1 Team Seat",
      "150 AI Visibility checks/bln",
      "250 halaman technical audit",
      "50 daily tracked keywords",
      "ChatGPT AI model integration",
      "1,500 bonus data credits",
      "Akses platform seumur hidup",
    ],
    popular: false,
  },
  {
    tier: 2,
    key: "appsumo_tier_2",
    name: "Tier 2",
    price: 79,
    target: "Freelancer / Konsultan",
    domains: "5 Domains · 2 Seats",
    limits: "500 AI checks/bln + BYOK 1.5k · 1.000 hal · 200 kw",
    bullets: [
      "5 Domains & 2 Team Seats",
      "500 AI checks/bln + BYOK 1.5k/bln",
      "1.000 halaman technical audit",
      "200 daily tracked keywords",
      "ChatGPT + Google Gemini models",
      "5,000 bonus data credits",
      "Integrasi BYOK API Keys terbuka",
    ],
    popular: false,
  },
  {
    tier: 3,
    key: "appsumo_tier_3",
    name: "Tier 3",
    price: 149,
    target: "Agensi / In-House SEO",
    domains: "15 Domains · 5 Seats",
    limits: "1.200 checks/bln + BYOK 10k · 5k hal · 750 kw",
    bullets: [
      "15 Domains & 5 Team Seats",
      "1.200 AI checks/bln + BYOK 10k/bln",
      "5.000 halaman technical audit",
      "750 daily tracked keywords",
      "ChatGPT, Claude, Gemini & Perplexity",
      "10,000 bonus data credits",
      "White-label PDF reports & CSV export",
    ],
    popular: true,
  },
  {
    tier: 4,
    key: "appsumo_tier_4",
    name: "Tier 4",
    price: 249,
    target: "Digital Agency Berkembang",
    domains: "50 Domains · 15 Seats",
    limits: "BYOK Unlimited (3 Workers) · 20k hal · 2.5k kw",
    bullets: [
      "50 Domains & 15 Team Seats",
      "BYOK Unlimited queries (3 workers)",
      "20.000 halaman technical audit",
      "2.500 daily tracked keywords",
      "Full White-label Client Reports",
      "25,000 bonus data credits",
      "Full REST API & Webhook automation",
    ],
    popular: false,
  },
  {
    tier: 5,
    key: "appsumo_tier_5",
    name: "Tier 5",
    price: 399,
    target: "Enterprise / Reseller",
    domains: "150 Domains · 50 Seats",
    limits: "BYOK True Unlimited (10 Workers) · 50k hal",
    bullets: [
      "150 Domains & 50 Team Seats",
      "BYOK True Unlimited (10 workers)",
      "50.000 halaman technical audit",
      "5.000 daily tracked keywords",
      "Custom CNAME Portal & White-label",
      "50,000 bonus data credits",
      "Priority 24/7 SLA & Roadmap input",
    ],
    popular: false,
  },
];

type LoaderData = {
  cohorts: EffectiveKeywordProCohort[];
};

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing & Lifetime Deals - SeoTool.im" },
      {
        name: "description",
        content:
          "SeoTool.im Lifetime Deals (LTD) & Subscriptions. Bayar sekali seumur hidup untuk pendukung awal (BYOK), paket AppSumo, atau retainer $1/bulan.",
      },
      { property: "og:title", content: "Pricing & Lifetime Deals - SeoTool.im" },
      {
        property: "og:description",
        content:
          "LTD bayar cuma sekali seumur hidup dengan BYOK, AppSumo tiers, atau $1/bln retainer.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://seotool.im/pricing" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async (): Promise<LoaderData> => {
    const cohorts = await getPublicCohortPricing();
    return { cohorts };
  },
  component: PricingPage,
});

function CohortCard({
  cohort,
  isCurrent,
  signedIn,
}: {
  cohort: EffectiveKeywordProCohort;
  isCurrent: boolean;
  signedIn: boolean;
}) {
  const priceDollars = (cohort.priceUsdCents / 100).toFixed(0);
  const spotsText =
    cohort.remaining == null
      ? "Unlimited spots"
      : cohort.remaining === 0
        ? "Sold out"
        : `${cohort.remaining} spot${cohort.remaining === 1 ? "" : "s"} tersisa`;
  const isSoldOut = cohort.remaining != null && cohort.remaining === 0;

  return (
    <div
      className={`relative flex flex-col justify-between rounded-2xl border p-6 transition-all ${
        isCurrent
          ? "border-primary shadow-lg ring-2 ring-primary/40 bg-primary/[0.03]"
          : isSoldOut
            ? "border-base-300 bg-base-200/40 opacity-60"
            : "border-base-300 bg-base-100 hover:border-primary/40 shadow-xs"
      }`}
    >
      {isCurrent ? (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3.5 py-0.5 text-xs font-bold text-white shadow-sm">
          Active Cohort
        </div>
      ) : null}

      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold tracking-tight text-base-content">
            {cohort.label}
          </h3>
          <span className="inline-flex items-center gap-1 text-xs text-base-content/60 font-medium">
            <Users className="size-3" />
            {spotsText}
          </span>
        </div>

        <div className="mt-4 flex flex-col gap-1">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold tracking-tight text-base-content">
              ${priceDollars}
            </span>
            <span className="badge badge-primary badge-outline text-[11px] font-bold">
              ONE-TIME / BAYAR 1X
            </span>
          </div>
          <span className="text-xs text-base-content/60 font-medium">
            Akses seumur hidup (Lifetime Access)
          </span>
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
          <Key className="size-3.5" />
          <span>BYOK (Bring Your Own Key) · Bebas Markup</span>
        </div>

        {cohort.capacity != null ? (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-base-content/60 mb-1">
              <span>{cohort.occupied} bergabung</span>
              <span>Maks {cohort.capacity}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-base-300">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{
                  width: `${Math.min(100, (cohort.occupied / cohort.capacity) * 100)}%`,
                }}
              />
            </div>
          </div>
        ) : null}

        <ul className="mt-5 space-y-2 text-xs text-base-content/80">
          <li className="flex items-center gap-2">
            <Check className="size-3.5 text-success shrink-0" />
            <span>Semua 12+ fitur SEO & audit terbuka</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="size-3.5 text-success shrink-0" />
            <span>Masukkan DataForSEO & AI API Key sendiri</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="size-3.5 text-success shrink-0" />
            <span>Gratis 5.000 platform data bonus credits</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="size-3.5 text-success shrink-0" />
            <span>Pembaruan sistem & engine seumur hidup</span>
          </li>
        </ul>
      </div>

      <div className="mt-6">
        {isSoldOut ? (
          <button disabled className="btn btn-disabled btn-md w-full">
            Sold Out
          </button>
        ) : signedIn ? (
          <Link
            to="/subscribe"
            search={{ plan: "ltd", cohort: cohort.key }}
            className={`btn w-full btn-md font-semibold ${
              isCurrent
                ? "btn-primary shadow-md shadow-primary/20"
                : "btn-outline border-base-300 hover:border-primary hover:bg-primary/5"
            }`}
          >
            {isCurrent ? `Ambil LTD (${cohort.label})` : `Pilih ${cohort.label}`}
            <ArrowRight className="size-4" />
          </Link>
        ) : (
          <Link
            to="/sign-up"
            search={{ redirect: `/subscribe?plan=ltd&cohort=${cohort.key}` }}
            className={`btn w-full btn-md font-semibold ${
              isCurrent
                ? "btn-primary shadow-md shadow-primary/20"
                : "btn-outline border-base-300 hover:border-primary hover:bg-primary/5"
            }`}
          >
            {isCurrent ? `Ambil LTD (${cohort.label})` : `Pilih ${cohort.label}`}
            <ArrowRight className="size-4" />
          </Link>
        )}
      </div>
    </div>
  );
}

function PricingPage() {
  const { signedIn } = useMarketingSession();
  const { cohorts } = Route.useLoaderData();
  const [activeTab, setActiveTab] = useState<"early_ltd" | "appsumo_ltd" | "retainer">("early_ltd");

  const currentCohort = cohorts.find(
    (c) => c.active && (c.capacity == null || c.occupied < c.capacity),
  );

  return (
    <MarketingChrome signedIn={signedIn}>
      <div className="grid-bg mx-auto w-full max-w-6xl px-4 pt-12 pb-20 md:pt-16 md:pb-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="badge badge-primary badge-outline text-xs font-bold uppercase tracking-wider py-2 px-3">
            LIFETIME DEALS & TRANSPARENT PRICING
          </span>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Pricing That Rewards Early Believers
          </h1>
          <p className="mt-4 text-base text-base-content/70 md:text-lg">
            Miliki akses platform SEO mandiri terlengkap. Bayar cuma sekali (LTD
            BYOK yang naik $10 per cohort), paket resmi AppSumo, atau mulai dari
            $1/bulan micro-retainer.
          </p>

          {/* Pricing Tabs Switcher */}
          <div className="mt-8 flex justify-center">
            <div className="inline-flex rounded-xl bg-base-200 p-1.5 shadow-inner">
              <button
                type="button"
                onClick={() => setActiveTab("early_ltd")}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs md:text-sm font-bold transition-all ${
                  activeTab === "early_ltd"
                    ? "bg-primary text-white shadow-sm"
                    : "text-base-content/70 hover:text-base-content"
                }`}
              >
                <Zap className="size-4" />
                Early Believer LTD (BYOK)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("appsumo_ltd")}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs md:text-sm font-bold transition-all ${
                  activeTab === "appsumo_ltd"
                    ? "bg-primary text-white shadow-sm"
                    : "text-base-content/70 hover:text-base-content"
                }`}
              >
                <Sparkles className="size-4" />
                AppSumo LTD (5 Tiers)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("retainer")}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs md:text-sm font-bold transition-all ${
                  activeTab === "retainer"
                    ? "bg-primary text-white shadow-sm"
                    : "text-base-content/70 hover:text-base-content"
                }`}
              >
                $1/bln Retainer & Bulanan
              </button>
            </div>
          </div>
        </div>

        {/* TAB 1: Early Believer LTD (One-Time + BYOK) */}
        {activeTab === "early_ltd" && (
          <div className="mt-12">
            <div className="mx-auto mb-8 max-w-3xl rounded-xl border border-primary/30 bg-primary/[0.04] p-5 text-center">
              <div className="flex items-center justify-center gap-2 text-primary font-bold text-sm">
                <Lock className="size-4" />
                <span>Model LTD Bayar Cuma Sekali — Harga Naik $10 Setiap Batch</span>
              </div>
              <p className="mt-2 text-xs md:text-sm text-base-content/75 leading-relaxed">
                Anda hanya membayar satu kali untuk lisensi platform seumur hidup. Menggunakan model{" "}
                <strong>BYOK (Bring Your Own Key)</strong>: Anda menghubungkan API key DataForSEO &
                AI milik Anda sendiri sehingga server kami tidak perlu membebankan markup biaya data
                ke Anda. Skalabilitas tanpa batas!
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {cohorts.map((cohort) => (
                <CohortCard
                  key={cohort.key}
                  cohort={cohort}
                  isCurrent={cohort.key === currentCohort?.key}
                  signedIn={signedIn}
                />
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: AppSumo Lifetime Deals (5 Tiers) */}
        {activeTab === "appsumo_ltd" && (
          <div className="mt-12">
            <div className="mx-auto mb-8 max-w-3xl rounded-xl border border-secondary/30 bg-secondary/[0.03] p-5 text-center">
              <span className="badge badge-secondary badge-sm font-bold uppercase mb-1">
                Official AppSumo Proposal Tiers
              </span>
              <h3 className="text-lg font-bold text-base-content">
                Pilih Kapasitas yang Sesuai dengan Skala Agensi Anda
              </h3>
              <p className="mt-1 text-xs md:text-sm text-base-content/70">
                Semua tier merupakan <strong>One-Time Payment</strong> seumur hidup. Tier 3 merupakan
                Sweet Spot terfavorit untuk agensi SEO.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5 items-stretch">
              {APPSUMO_TIERS.map((tier) => (
                <div
                  key={tier.tier}
                  className={`relative flex flex-col justify-between rounded-2xl border p-5 transition-all ${
                    tier.popular
                      ? "border-primary shadow-xl ring-2 ring-primary/40 bg-gradient-to-b from-primary/[0.04] to-base-100"
                      : "border-base-300 bg-base-100 hover:border-base-content/20 shadow-xs"
                  }`}
                >
                  {tier.popular ? (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-cyan-500 px-3 py-0.5 text-[10px] font-extrabold text-white shadow-sm">
                      ★ SWEET SPOT
                    </div>
                  ) : null}

                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-base-content">
                        {tier.name}
                      </h4>
                      <span className="badge badge-sm badge-ghost text-[10px] font-semibold">
                        LTD
                      </span>
                    </div>

                    <p className="text-[11px] text-base-content/60 mt-1 min-h-[30px]">
                      {tier.target}
                    </p>

                    <div className="mt-3 flex items-baseline gap-1 border-b border-base-200 pb-3">
                      <span className="text-3xl font-extrabold text-base-content">
                        ${tier.price}
                      </span>
                      <span className="text-[11px] text-base-content/50 font-medium">
                        / sekali bayar
                      </span>
                    </div>

                    <div className="mt-3 text-xs font-semibold text-primary">
                      {tier.domains}
                    </div>

                    <ul className="mt-4 space-y-2 text-xs text-base-content/75">
                      {tier.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-1.5">
                          <Check className="size-3 text-success shrink-0 mt-0.5" />
                          <span className="text-[11px] leading-tight">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 pt-3 border-t border-base-200">
                    <Link
                      to="/subscribe"
                      search={{ plan: "appsumo", tier: tier.tier }}
                      className={`btn w-full btn-sm font-bold ${
                        tier.popular ? "btn-primary shadow-sm" : "btn-outline"
                      }`}
                    >
                      Beli Tier {tier.tier} (${tier.price})
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Retainer $1 & Subscriptions */}
        {activeTab === "retainer" && (
          <div className="mt-12">
            <div className="mx-auto max-w-2xl rounded-2xl border border-primary/30 bg-primary/[0.03] p-8 text-center shadow-xs">
              <span className="badge badge-primary badge-sm font-semibold">
                MICRO RETAINER
              </span>
              <h3 className="mt-3 text-2xl font-bold tracking-tight text-base-content">
                Mulai Dari $1/bulan — 100% Jadi Kredit Permanen
              </h3>
              <p className="mt-3 text-sm text-base-content/70 leading-relaxed max-w-xl mx-auto">
                Bagi Anda yang menginginkan komitmen paling ringan: setiap $1 dikonversi 100% menjadi
                1.000 kredit pemakaian. Kredit ini terus terakumulasi (roll over) dan{" "}
                <strong>tidak pernah hangus selamanya</strong>. Bahkan jika Anda membatalkan paket,
                sisa saldo kredit tetap menjadi milik Anda.
              </p>
              <div className="mt-6 flex justify-center">
                <Link
                  to="/subscribe"
                  search={{ plan: "starter" }}
                  className="btn btn-primary btn-md rounded-xl font-bold shadow-md shadow-primary/20 gap-2 px-6"
                >
                  Mulai $1/bulan Retainer
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Credit Transparency */}
        <section className="mx-auto mt-20 max-w-5xl">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Credit Transparency
            </span>
            <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              Simulasi Pemakaian & Transparansi Biaya
            </h2>
            <p className="mt-2 text-sm text-base-content/70 max-w-2xl mx-auto">
              Sistem kredit bekerja seperti saldo pulsa prabayar. Lihat rincian biaya per aksi atau
              simulasikan kebutuhan bulanan Anda.
            </p>
          </div>

          <div className="mt-10">
            <CreditPricingGuide />
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mx-auto mt-20 max-w-3xl">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Ada Pertanyaan?
            </span>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="mt-8 space-y-4">
            {FAQ_ITEMS.map((item) => (
              <div
                key={item.question}
                className="rounded-xl border border-base-300 bg-base-100 p-5 shadow-xs transition-all hover:border-primary/30"
              >
                <h3 className="text-base font-bold text-base-content">
                  {item.question}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-base-content/70">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </MarketingChrome>
  );
}
