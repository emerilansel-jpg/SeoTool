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
});
