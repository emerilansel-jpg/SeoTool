import { describe, expect, it } from "vitest";
import {
  analyzeSentiment,
  extractMentions,
  extractRankPosition,
  type TrackingEntity,
} from "./extraction";

describe("extractRankPosition", () => {
  it("detects 1-based rank from numbered lists", () => {
    const text = `Here are the top CRM tools:
1. Zoho CRM - great for budget teams
2. Salesforce - enterprise standard
3. HubSpot - inbound marketing focus`;

    expect(extractRankPosition(text, ["Zoho", "zoho.com"])).toBe(1);
    expect(extractRankPosition(text, ["Salesforce"])).toBe(2);
    expect(extractRankPosition(text, ["HubSpot"])).toBe(3);
    expect(extractRankPosition(text, ["Pipedrive"])).toBeNull();
  });

  it("detects bold numbered lists", () => {
    const text = `**1. Salesforce** is best.
**2. Zoho** is affordable.`;
    expect(extractRankPosition(text, ["Zoho"])).toBe(2);
  });

  it("returns null for non-ranked text", () => {
    const text = "Zoho is a popular software suite with many cloud tools.";
    expect(extractRankPosition(text, ["Zoho"])).toBeNull();
  });
});

describe("analyzeSentiment", () => {
  it("identifies positive sentiment", () => {
    expect(analyzeSentiment("Zoho is the best and most affordable tool.")).toBe(
      "positive",
    );
  });

  it("identifies negative sentiment", () => {
    expect(
      analyzeSentiment("The interface is slow and complex to configure."),
    ).toBe("negative");
  });

  it("identifies mixed sentiment", () => {
    expect(
      analyzeSentiment("Great features, but the setup is slow and complex."),
    ).toBe("mixed");
  });

  it("identifies neutral sentiment", () => {
    expect(analyzeSentiment("Zoho is an Indian multinational company.")).toBe(
      "neutral",
    );
  });

  it("identifies enhanced positive keywords like solution, specializes, and rekomendasi", () => {
    expect(
      analyzeSentiment(
        "JetDigitalPro provides robust SEO solutions for startups.",
      ),
    ).toBe("positive");
    expect(
      analyzeSentiment(
        "JetDigitalPro merupakan rekomendasi terbaik dan solusi unggul.",
      ),
    ).toBe("positive");
  });
});

describe("extractMentions", () => {
  it("extracts target and competitor mentions with positions and sentiment", () => {
    const text = `Top CRM solutions:
1. Zoho CRM is an excellent and affordable choice for small businesses.
2. Salesforce is powerful but expensive.`;

    const entities: TrackingEntity[] = [
      {
        name: "Zoho",
        domain: "zoho.com",
        aliases: ["Zoho CRM"],
        isTargetBrand: true,
      },
      {
        name: "Salesforce",
        domain: "salesforce.com",
        aliases: [],
        isTargetBrand: false,
      },
      {
        name: "HubSpot",
        domain: "hubspot.com",
        aliases: [],
        isTargetBrand: false,
      },
    ];

    const citations = [
      { url: "https://zoho.com/crm", domain: "zoho.com", title: "Zoho CRM" },
    ];

    const mentions = extractMentions(text, citations, entities);

    expect(mentions).toHaveLength(2);
    const zoho = mentions.find((m) => m.brandName === "Zoho");
    expect(zoho).toBeDefined();
    expect(zoho?.isTargetBrand).toBe(true);
    expect(zoho?.position).toBe(1);
    expect(zoho?.sentiment).toBe("positive");

    const salesforce = mentions.find((m) => m.brandName === "Salesforce");
    expect(salesforce).toBeDefined();
    expect(salesforce?.isTargetBrand).toBe(false);
    expect(salesforce?.position).toBe(2);
    expect(salesforce?.sentiment).toBe("mixed");
  });

  it("counts a prose brand mention without inventing a list position", () => {
    const mentions = extractMentions(
      "Zoho is an Indian multinational software company.",
      [],
      [
        {
          name: "Zoho",
          domain: "zoho.com",
          aliases: ["Zoho CRM"],
          isTargetBrand: true,
        },
      ],
    );

    expect(mentions).toHaveLength(1);
    expect(mentions[0]).toMatchObject({
      brandName: "Zoho",
      position: null,
      sentiment: "neutral",
    });
  });

  it("does not count target brand when response only echoes prompt in preamble and lists competitors", () => {
    const prompt = "Top alternatives and competitors to filterairgadingserpong";
    const text = `Based on my search results, "filterairgadingserpong" refers to water filter services in the Gading Serpong area.
Here are the top alternatives and competitors:
1. Avorio Filter Air
2. Nanotec Filter Air
3. Depo Filter Air`;

    const citations = [
      {
        url: "https://www.avoriofilterair.com/2021/08/filter-air-gading-serpong.html",
        domain: "avoriofilterair.com",
        title: "Filter Air Gading Serpong",
      },
      {
        url: "https://filterairnanotec.com/filter-air-gading-serpong/",
        domain: "filterairnanotec.com",
        title: "Filter Air Nanotec Gading Serpong",
      },
    ];

    const entities: TrackingEntity[] = [
      {
        name: "filterairgadingserpong",
        domain: "filterairgadingserpong.com",
        aliases: ["filter air gading serpong"],
        isTargetBrand: true,
      },
      {
        name: "Avorio Filter Air",
        domain: "avoriofilterair.com",
        aliases: [],
        isTargetBrand: false,
      },
    ];

    const mentions = extractMentions(text, citations, entities, prompt);

    // Target brand should NOT be counted as mentioned
    const targetMention = mentions.find((m) => m.isTargetBrand);
    expect(targetMention).toBeUndefined();

    // Competitor Avorio SHOULD be counted
    const avorio = mentions.find((m) => m.brandName === "Avorio Filter Air");
    expect(avorio).toBeDefined();
    expect(avorio?.position).toBe(1);
  });

  it("does not count target brand when model returns a negative disclaimer of not found", () => {
    const text =
      'I searched for "filterairgadingserpong" but the results don\'t show any specific business or service by that exact name.';
    const entities: TrackingEntity[] = [
      {
        name: "filterairgadingserpong",
        domain: "filterairgadingserpong.com",
        aliases: [],
        isTargetBrand: true,
      },
    ];

    const mentions = extractMentions(text, [], entities);
    expect(mentions).toHaveLength(0);
  });

  it("does not falsely associate competitor citations with target brand due to keyword in title", () => {
    const text = "Water filters are great.";
    const citations = [
      {
        url: "https://www.depofilterair.com/2021/04/filter-air-gading-serpong.html",
        domain: "depofilterair.com",
        title: "Filter Air Gading Serpong",
      },
    ];
    const entities: TrackingEntity[] = [
      {
        name: "filterairgadingserpong",
        domain: "filterairgadingserpong.com",
        aliases: ["filter air gading serpong"],
        isTargetBrand: true,
      },
    ];

    const mentions = extractMentions(text, citations, entities);
    expect(mentions).toHaveLength(0);
  });

  it("does not count target brand when response defines generic terms or gives negative disclaimers in Indonesian", () => {
    const prompt =
      "Apa itu Filter Air Gading Serpong dan masalah air apa saja yang bisa diatasi?";
    const textDefinitional =
      "Filter Air Gading Serpong adalah istilah yang merujuk pada layanan atau sistem penyaringan air untuk rumah dan bangunan di kawasan Gading Serpong, Tangerang. Tujuannya adalah memperbaiki kualitas air dari sumur bor maupun suplai air PAM/PDAM.";

    const textDisclaimer =
      "Saya coba menelusuri “filterairgadingserpong.com”, tetapi dalam pencarian singkat saya belum bisa memuat atau menemukan halaman resminya.";

    const entities: TrackingEntity[] = [
      {
        name: "Filter Air Gading Serpong",
        domain: "filterairgadingserpong.com",
        aliases: ["filter air gading serpong", "filterairgadingserpong"],
        isTargetBrand: true,
      },
    ];

    expect(
      extractMentions(textDefinitional, [], entities, prompt),
    ).toHaveLength(0);
    expect(extractMentions(textDisclaimer, [], entities, prompt)).toHaveLength(
      0,
    );
  });

  it("does not count target brand when competitor bullet quotes brand keywords as a page title", () => {
    const text =
      "- JasaServiceFilterAir (Jakoha) punya halaman khusus “Jasa Service Filter Air Gading Serpong” serta artikel dengan testimoni singkat.";
    const entities: TrackingEntity[] = [
      {
        name: "Filter Air Gading Serpong",
        domain: "filterairgadingserpong.com",
        aliases: ["filter air gading serpong"],
        isTargetBrand: true,
      },
      {
        name: "JasaServiceFilterAir",
        domain: "jasaservicefilterair.com",
        aliases: ["Jakoha"],
        isTargetBrand: false,
      },
    ];

    const mentions = extractMentions(text, [], entities);
    const targetMention = mentions.find((m) => m.isTargetBrand);
    expect(targetMention).toBeUndefined();
    const compMention = mentions.find((m) => !m.isTargetBrand);
    expect(compMention).toBeDefined();
  });
});
