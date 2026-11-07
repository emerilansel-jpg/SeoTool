import { describe, expect, it } from "vitest";
import {
  extractCidFromFeatureId,
  isGoogleMapsUrl,
  isShortGoogleMapsUrl,
  normalizeCid,
  parseGoogleMapsUrl,
} from "./google-maps-url";
import { findGmbRank } from "@/server/features/gmb-grid/gmb-grid";

describe("Google Maps URL Parser & CID Normalizer", () => {
  it("normalizes hex and decimal CIDs consistently", () => {
    // 0xfb53b4d5a4379d52 -> 18110017356263038290
    expect(normalizeCid("0xfb53b4d5a4379d52")).toBe("18110017356263038290");
    expect(normalizeCid("18110017356263038290")).toBe("18110017356263038290");
    expect(normalizeCid(null)).toBeNull();
  });

  it("extracts CID from feature ID 0x...:0x...", () => {
    const featureId = "0x88569f7344c445e9:0xfb53b4d5a4379d52";
    expect(extractCidFromFeatureId(featureId)).toBe("18110017356263038290");
  });

  it("identifies Google Maps URLs and shortened URLs", () => {
    expect(
      isGoogleMapsUrl("https://www.google.com/maps/place/Lapis+Patios/"),
    ).toBe(true);
    expect(isGoogleMapsUrl("https://maps.app.goo.gl/abcdef123")).toBe(true);
    expect(isGoogleMapsUrl("https://example.com/other")).toBe(false);

    expect(isShortGoogleMapsUrl("https://maps.app.goo.gl/abcdef123")).toBe(true);
    expect(isShortGoogleMapsUrl("https://goo.gl/maps/xyz987")).toBe(true);
    expect(
      isShortGoogleMapsUrl("https://www.google.com/maps/place/Lapis+Patios/"),
    ).toBe(false);
  });

  it("parses the user exact Google Maps place URL with high precision coordinates and CID", () => {
    const userUrl =
      "https://www.google.com/maps/place/Lapis+Patios+%26+Hardscapes/@35.2864557,-81.5296386,9z/data=!3m1!4b1!4m6!3m5!1s0x88569f7344c445e9:0xfb53b4d5a4379d52!8m2!3d35.288245!4d-80.8702244!16s%2Fg%2F11j4zklpb7?entry=ttu&g_ep=EgoyMDI2MTEwMy4wIKXMDSoASAFQAw%3D%3D";

    const parsed = parseGoogleMapsUrl(userUrl);
    expect(parsed).not.toBeNull();
    expect(parsed?.businessName).toBe("Lapis Patios & Hardscapes");
    // Pinpoint coordinates from !3d and !4d should be preferred over @ viewport coordinates
    expect(parsed?.lat).toBe(35.288245);
    expect(parsed?.lng).toBe(-80.8702244);
    expect(parsed?.placeId).toBe("0x88569f7344c445e9:0xfb53b4d5a4379d52");
    expect(parsed?.cid).toBe("18110017356263038290");
  });

  it("parses fallback coordinates from @lat,lng when !3d/!4d not present", () => {
    const url =
      "https://www.google.com/maps/place/Downtown+Bakery/@40.7128,-74.0060,17z/";
    const parsed = parseGoogleMapsUrl(url);
    expect(parsed?.businessName).toBe("Downtown Bakery");
    expect(parsed?.lat).toBe(40.7128);
    expect(parsed?.lng).toBe(-74.006);
  });

  it("parses ChIJ place ID from Google Maps search URL", () => {
    const url =
      "https://www.google.com/maps/search/?api=1&query=Pizza&query_place_id=ChIJN1t_tDeuEmsRUsoyG83frY4";
    const parsed = parseGoogleMapsUrl(url);
    expect(parsed?.placeId).toBe("ChIJN1t_tDeuEmsRUsoyG83frY4");
  });

  it("findGmbRank matches targets using hex CID from URL against decimal CID in DataForSEO", () => {
    const rank = findGmbRank(
      [
        {
          type: "maps_search",
          title: "Other Business",
          place_id: "other_id",
          cid: "9999999999",
          rank_group: 1,
        },
        {
          type: "maps_search",
          title: "Lapis Patios & Hardscapes",
          place_id: "ChIJ4UXERHOfVogRUp03pNW0U_s",
          cid: "18110017356263038290", // Decimal CID in DataForSEO
          rank_group: 3,
        },
      ],
      {
        businessName: "Lapis Patios & Hardscapes",
        placeId: "0x88569f7344c445e9:0xfb53b4d5a4379d52", // Hex feature ID from URL
        cid: "18110017356263038290",
      },
    );

    expect(rank).toBe(3);
  });
});
