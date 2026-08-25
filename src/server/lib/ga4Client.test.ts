import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAccessToken: vi.fn(),
  fetch: vi.fn<typeof fetch>(),
}));

vi.mock("@/lib/auth", () => ({
  getAuth: () => ({ api: { getAccessToken: mocks.getAccessToken } }),
}));

function jsonResponse(body: unknown, status = 200) {
  return Response.json(body, { status });
}

describe("ga4Client", () => {
  beforeEach(() => {
    mocks.getAccessToken.mockReset();
    mocks.getAccessToken.mockResolvedValue({ accessToken: "tok_123" });
    mocks.fetch.mockReset();
    vi.stubGlobal("fetch", mocks.fetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("maps Google's string account resource to selectable GA4 properties", async () => {
    mocks.fetch.mockResolvedValue(
      jsonResponse({
        accountSummaries: [
          {
            name: "accountSummaries/123",
            account: "accounts/123",
            displayName: "Example account",
            propertySummaries: [
              {
                property: "properties/456",
                displayName: "Example property",
              },
            ],
          },
        ],
      }),
    );

    const { createGa4Client } = await import("./ga4Client");
    const properties = await createGa4Client({
      userId: "u1",
      ga4AccountId: "google-sub-a",
    }).listProperties();

    expect(properties).toEqual([
      {
        property: "properties/456",
        displayName: "Example property",
        accountId: "accounts/123",
      },
    ]);
    expect(mocks.getAccessToken).toHaveBeenCalledWith({
      body: {
        providerId: "google-analytics",
        userId: "u1",
        accountId: "google-sub-a",
      },
    });
    expect(mocks.fetch.mock.calls[0]?.[0]).toBe(
      "https://analyticsadmin.googleapis.com/v1beta/accountSummaries?pageSize=200",
    );
  });

  it("loads every account-summary page", async () => {
    mocks.fetch
      .mockResolvedValueOnce(
        jsonResponse({
          accountSummaries: [
            {
              account: "accounts/1",
              propertySummaries: [{ property: "properties/1" }],
            },
          ],
          nextPageToken: "next page",
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          accountSummaries: [
            {
              account: "accounts/2",
              propertySummaries: [
                { property: "properties/2", displayName: "Second" },
              ],
            },
          ],
        }),
      );

    const { createGa4Client } = await import("./ga4Client");
    const properties = await createGa4Client({ userId: "u1" }).listProperties();

    expect(properties).toEqual([
      {
        property: "properties/1",
        displayName: "properties/1",
        accountId: "accounts/1",
      },
      {
        property: "properties/2",
        displayName: "Second",
        accountId: "accounts/2",
      },
    ]);
    expect(mocks.fetch).toHaveBeenCalledTimes(2);
    expect(mocks.fetch.mock.calls[1]?.[0]).toBe(
      "https://analyticsadmin.googleapis.com/v1beta/accountSummaries?pageSize=200&pageToken=next+page",
    );
  });
});
