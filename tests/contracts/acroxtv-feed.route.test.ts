import { expect, test } from "@playwright/test";
import { createProgramFeedRoute } from "@/app/api/acroxtv-feed/[slug]/route";
import { createProgramFeedService } from "@/application/acroxtv-feed.service";
import { PROGRAMS } from "@/domain/programs";
import { PROGRAM_MEDIA_SOURCES } from "@/infrastructure/program-media-sources";
import { env } from "@/lib/env";
import { createSWRStore } from "@/infrastructure/swr-cache";
const requestFor = (slug: string) => new Request(`http://localhost/api/acroxtv-feed/${slug}`);

const contextFor = (slug: string) => ({ params: Promise.resolve({ slug }) });

const originalYouTubeApiKey = env.youtubeApiKey;

test.afterEach(() => {
  env.youtubeApiKey = originalYouTubeApiKey;
});

test.describe("program-scoped Acrox TV feed route", () => {
  test("registers the canonical Alta route with its existing playlist", () => {
    expect(PROGRAMS.map((program) => program.slug)).toEqual([
      "alta-data-te-tire",
      "mas-que-nutricion"
    ]);
    expect(PROGRAM_MEDIA_SOURCES["alta-data-te-tire"].youtube.playlistId).toBe(
      "PL0Nzx2OTlHZ_ZOlLPB6gPjhH88yFGIF_y"
    );
  });

  test("returns an available response with no-store caching from an injected service", async () => {
    const GET = createProgramFeedRoute({
      get: async () => ({
        programSlug: "alta-data-te-tire",
        episodes: { state: "available" as const, asOf: "2026-08-01T12:00:00.000Z", items: [] },
        instagram: { state: "unavailable" as const }, live: { state: "unavailable" as const }
      })
    });

    const response = await GET(requestFor("alta-data-te-tire"), contextFor("alta-data-te-tire"));

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store, max-age=0");
    await expect(response.json()).resolves.toMatchObject({
      programSlug: "alta-data-te-tire",
      episodes: { state: "available", items: [] }
    });
  });

  test("returns stale cached episodes when the service refresh fails", async () => {
    env.youtubeApiKey = "provider-key";
    const store = createSWRStore();
    let shouldFail = false;
    let providerCalls = 0;
    let currentTime = 0;
    const service = createProgramFeedService({
      store,
      now: () => currentTime,
      fetchEpisodes: async () => {
        providerCalls += 1;
        if (shouldFail) throw new Error("provider unavailable");
        return [
          {
            videoId: "attributable-episode",
            title: "Attributable episode",
            watchUrl: "https://youtube.example/attributable-episode",
            thumbnailUrl: "https://images.example/attributable-episode.jpg",
            publishedAt: "2026-08-01T11:00:00.000Z",
            durationSeconds: 60,
            viewCount: 42
          }
        ];
      }
    });
    const GET = createProgramFeedRoute(service);

    await GET(requestFor("alta-data-te-tire"), contextFor("alta-data-te-tire"));
    shouldFail = true;
    currentTime = 30 * 60 * 1000 + 1;
    const response = await GET(requestFor("alta-data-te-tire"), contextFor("alta-data-te-tire"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      episodes: { state: "stale", items: [expect.objectContaining({ videoId: "attributable-episode" })] }
    });
    await Promise.resolve();
    expect(providerCalls).toBe(2);
  });

  test("returns an error surface when the service has no attributable cache", async () => {
    env.youtubeApiKey = "provider-key";
    const GET = createProgramFeedRoute(
      createProgramFeedService({
        store: createSWRStore(),
        fetchEpisodes: async () => { throw new Error("provider unavailable"); }
      })
    );

    const response = await GET(requestFor("alta-data-te-tire"), contextFor("alta-data-te-tire"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ episodes: { state: "error" } });
  });

  test("returns 404 when the injected service rejects an unknown slug", async () => {
    const GET = createProgramFeedRoute({ get: async () => null });

    const response = await GET(requestFor("not-a-program"), contextFor("not-a-program"));

    expect(response.status).toBe(404);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store, max-age=0");
    expect(await response.text()).toBe("");
  });
});
