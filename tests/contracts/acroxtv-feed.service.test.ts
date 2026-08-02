import { expect, test } from "@playwright/test";
import { createProgramFeedService } from "@/application/acroxtv-feed.service";
import { createSWRStore, getSWRResource } from "@/infrastructure/swr-cache";
import { env } from "@/lib/env";

const originalYouTubeApiKey = env.youtubeApiKey;

test.afterEach(() => {
  env.youtubeApiKey = originalYouTubeApiKey;
});

test.describe("program-scoped media service", () => {
  test("rejects an unknown slug before it can reach the provider", async () => {
    let providerCalls = 0;
    const service = createProgramFeedService({
      fetchEpisodes: async () => {
        providerCalls += 1;
        return [];
      }
    });

    await expect(service.get("not-a-program")).resolves.toBeNull();
    expect(providerCalls).toBe(0);
  });

  test("keeps program cache/single-flight isolated and asOf stable", async () => {
    env.youtubeApiKey = "provider-key";
    const store = createSWRStore();
    const calls: string[] = [];
    let currentTime = 1_000;
    const service = createProgramFeedService({
      store,
      now: () => currentTime,
      fetchEpisodes: async (source) => {
        calls.push(source.playlistId);
        return [
          {
            videoId: source.playlistId,
            title: source.playlistId,
            watchUrl: `https://youtube.example/${source.playlistId}`,
            thumbnailUrl: "https://images.example/episode.jpg",
            publishedAt: "2026-08-01T12:00:00Z",
            durationSeconds: 3600,
            viewCount: 42
          }
        ];
      }
    });

    const [altaFirst, altaSecond, nutrition] = await Promise.all([
      service.get("alta-data-te-tire"),
      service.get("alta-data-te-tire"),
      service.get("mas-que-nutricion")
    ]);

    expect(calls).toEqual([
      "PL0Nzx2OTlHZ_ZOlLPB6gPjhH88yFGIF_y",
      "PL0Nzx2OTlHZ_42gBgmG_9d6UqJgoXhWSq"
    ]);
    expect([altaFirst, altaSecond, nutrition].map((feed) => feed?.episodes)).toMatchObject([
      { state: "available", items: [{ videoId: "PL0Nzx2OTlHZ_ZOlLPB6gPjhH88yFGIF_y" }] },
      { state: "available", items: [{ videoId: "PL0Nzx2OTlHZ_ZOlLPB6gPjhH88yFGIF_y" }] },
      { state: "available", items: [{ videoId: "PL0Nzx2OTlHZ_42gBgmG_9d6UqJgoXhWSq" }] }
    ]);
    currentTime = 1_500;
    const cached = await service.get("alta-data-te-tire");

    expect(altaFirst?.episodes).toMatchObject({ asOf: "1970-01-01T00:00:01.000Z" });
    expect(cached?.episodes).toMatchObject({ state: "available", asOf: "1970-01-01T00:00:01.000Z" });
    expect(calls).toHaveLength(2);
  });

  test("returns a stale cached surface after a refresh failure and no items on an uncached error", async () => {
    const store = createSWRStore();
    let shouldFail = false;
    let currentTime = 0;
    const now = () => currentTime;
    const load = async () => {
      if (shouldFail) throw new Error("provider unavailable");
      return "attributable-item";
    };

    await expect(
      getSWRResource({ key: "alta", ttlMs: 1, staleMs: 10, load, now }, store)
    ).resolves.toMatchObject({ value: "attributable-item", state: "revalidated" });
    shouldFail = true;
    currentTime = 2;
    const stale = await getSWRResource({
      key: "alta",
      ttlMs: -1,
      staleMs: 1_000,
      load,
      now,
      shouldRefresh: () => false
    }, store);

    expect(stale).toMatchObject({ value: "attributable-item", state: "stale", updatedAt: 0 });
    await expect(
      getSWRResource({ key: "nutrition", ttlMs: 1, staleMs: 10, load, now }, store)
    ).rejects.toThrow("provider unavailable");
  });
});
