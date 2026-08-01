import { expect, test } from "@playwright/test";
import {
  PROGRAM_MEDIA_SOURCES,
  type ProgramYouTubeSource
} from "@/infrastructure/program-media-sources";
import {
  fetchAcroxTvYouTubeFeed,
  fetchProgramYouTubeFeed
} from "@/infrastructure/youtube.client";
import { env } from "@/lib/env";

const originalFetch = globalThis.fetch;
const originalYouTubeApiKey = env.youtubeApiKey;
const originalYouTubeChannelId = env.youtubeChannelId;
const originalYouTubePlaylistId = env.youtubePlaylistId;

const playlistItemsResponse = (videoId: string) => ({
  items: [{ contentDetails: { videoId } }]
});

const videoDetailsResponse = (videoId: string, title: string) => ({
  items: [
    {
      id: videoId,
      snippet: {
        title,
        publishedAt: "2026-08-01T12:00:00Z",
        thumbnails: { high: { url: `https://images.example/${videoId}.jpg` } }
      },
      contentDetails: { duration: "PT1H2M3S" },
      statistics: { viewCount: "42" }
    }
  ]
});

const respondForPlaylist = (source: ProgramYouTubeSource, videoId: string, title: string) => {
  const requests: URL[] = [];
  globalThis.fetch = async (input) => {
    const requestUrl = new URL(input.toString());
    requests.push(requestUrl);

    if (requestUrl.pathname.endsWith("/playlistItems")) {
      return Response.json(playlistItemsResponse(videoId));
    }

    return Response.json(videoDetailsResponse(videoId, title));
  };

  return requests;
};

test.beforeEach(() => {
  env.youtubeApiKey = "provider-key";
});

test.afterEach(() => {
  globalThis.fetch = originalFetch;
  env.youtubeApiKey = originalYouTubeApiKey;
  env.youtubeChannelId = originalYouTubeChannelId;
  env.youtubePlaylistId = originalYouTubePlaylistId;
});

test.describe("program YouTube provider contract", () => {
  test("selects Alta Data's exact playlist and normalizes its attributable episode", async () => {
    const source = PROGRAM_MEDIA_SOURCES["alta-data"].youtube;
    const requests = respondForPlaylist(source, "alta-video", "Alta episode");

    const result = await fetchProgramYouTubeFeed(source);

    expect(requests[0].toString()).toBe(
      "https://www.googleapis.com/youtube/v3/playlistItems?key=provider-key&playlistId=PL0Nzx2OTlHZ_ZOlLPB6gPjhH88yFGIF_y&part=contentDetails&maxResults=50"
    );
    expect(result).toEqual([
      {
        videoId: "alta-video",
        title: "Alta episode",
        watchUrl: "https://www.youtube.com/watch?v=alta-video",
        thumbnailUrl: "https://images.example/alta-video.jpg",
        publishedAt: "2026-08-01T12:00:00Z",
        durationSeconds: 3723,
        viewCount: 42
      }
    ]);
  });

  test("selects Más que Nutrición's exact playlist without returning Alta Data items", async () => {
    const source = PROGRAM_MEDIA_SOURCES["mas-que-nutricion"].youtube;
    const requests = respondForPlaylist(source, "nutrition-video", "Nutrition episode");

    const result = await fetchProgramYouTubeFeed(source);

    expect(requests[0].toString()).toBe(
      "https://www.googleapis.com/youtube/v3/playlistItems?key=provider-key&playlistId=PL0Nzx2OTlHZ_42gBgmG_9d6UqJgoXhWSq&part=contentDetails&maxResults=50"
    );
    expect(result.map((episode) => episode.videoId)).toEqual(["nutrition-video"]);
    expect(result.map((episode) => episode.videoId)).not.toContain("alta-video");
  });

  test("propagates provider failures instead of returning another program's episodes", async () => {
    const source = PROGRAM_MEDIA_SOURCES["mas-que-nutricion"].youtube;
    globalThis.fetch = async () =>
      Response.json(
        { error: { message: "quota exhausted", errors: [{ reason: "quotaExceeded" }] } },
        { status: 403 }
      );

    await expect(fetchProgramYouTubeFeed(source)).rejects.toMatchObject({
      name: "YouTubeApiError",
      status: 403,
      reason: "quotaExceeded"
    });
  });

  test("returns no episodes when the assigned playlist response is empty", async () => {
    const source = PROGRAM_MEDIA_SOURCES["alta-data"].youtube;
    const requests: URL[] = [];
    globalThis.fetch = async (input) => {
      requests.push(new URL(input.toString()));
      return Response.json({ items: [] });
    };

    await expect(fetchProgramYouTubeFeed(source)).resolves.toEqual([]);
    expect(requests.map((request) => request.pathname)).toEqual(["/youtube/v3/playlistItems"]);
  });

  test("ignores malformed playlist items without requesting video details", async () => {
    const source = PROGRAM_MEDIA_SOURCES["alta-data"].youtube;
    const requests: URL[] = [];
    globalThis.fetch = async (input) => {
      requests.push(new URL(input.toString()));
      return Response.json({ items: [{ contentDetails: {} }, {}] });
    };

    await expect(fetchProgramYouTubeFeed(source)).resolves.toEqual([]);
    expect(requests.map((request) => request.pathname)).toEqual(["/youtube/v3/playlistItems"]);
  });

  test("propagates a video-details failure after accepting its assigned playlist", async () => {
    const source = PROGRAM_MEDIA_SOURCES["alta-data"].youtube;
    const requests: URL[] = [];
    globalThis.fetch = async (input) => {
      const requestUrl = new URL(input.toString());
      requests.push(requestUrl);
      if (requestUrl.pathname.endsWith("/playlistItems")) {
        return Response.json(playlistItemsResponse("alta-video"));
      }

      return Response.json({ error: { message: "details unavailable" } }, { status: 500 });
    };

    await expect(fetchProgramYouTubeFeed(source)).rejects.toMatchObject({
      name: "YouTubeApiError",
      status: 500
    });
    expect(requests.map((request) => request.pathname)).toEqual([
      "/youtube/v3/playlistItems",
      "/youtube/v3/videos"
    ]);
  });

  test("does not let a scoped quota failure block the legacy Acrox feed", async () => {
    const source = PROGRAM_MEDIA_SOURCES["alta-data"].youtube;
    env.youtubeChannelId = "legacy-channel";
    env.youtubePlaylistId = "legacy-playlist";
    const requests: URL[] = [];

    globalThis.fetch = async (input) => {
      const requestUrl = new URL(input.toString());
      requests.push(requestUrl);
      const playlistId = requestUrl.searchParams.get("playlistId");

      if (playlistId === source.playlistId) {
        return Response.json(
          { error: { message: "quota exhausted", errors: [{ reason: "quotaExceeded" }] } },
          { status: 403 }
        );
      }
      if (requestUrl.pathname.endsWith("/search")) {
        return Response.json({ items: [] });
      }
      if (requestUrl.pathname.endsWith("/playlistItems")) {
        return Response.json(playlistItemsResponse("legacy-video"));
      }

      return Response.json(videoDetailsResponse("legacy-video", "Legacy episode"));
    };

    await expect(fetchProgramYouTubeFeed(source)).rejects.toMatchObject({
      reason: "quotaExceeded"
    });

    const legacyFeed = await fetchAcroxTvYouTubeFeed();

    expect(legacyFeed).toMatchObject({
      hasError: false,
      episodes: [expect.objectContaining({ videoId: "legacy-video" })]
    });
    expect(requests.map((request) => request.pathname)).toEqual([
      "/youtube/v3/playlistItems",
      "/youtube/v3/search",
      "/youtube/v3/playlistItems",
      "/youtube/v3/videos"
    ]);
  });
});
