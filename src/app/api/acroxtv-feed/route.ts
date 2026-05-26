import { NextResponse } from "next/server";
import type { AcroxTvFeedResponse } from "@/domain/acroxtv-feed";
import type { SocialContentItem } from "@/domain/social-content";
import { primeInstagramAssetCache } from "@/infrastructure/instagram-asset";
import { fetchInstagramContent } from "@/infrastructure/instagram.client";
import { fetchAcroxTvYouTubeFeed } from "@/infrastructure/youtube.client";
import { getSWRResource } from "@/infrastructure/swr-cache";

export const dynamic = "force-dynamic";
export const revalidate = 300;
const INSTAGRAM_CACHE_KEY = "ig:acroxtv:feed";
const INSTAGRAM_TTL_MS = 5 * 60 * 1000;
const INSTAGRAM_STALE_MS = 15 * 60 * 1000;

const redactAccessTokens = (value: string): string =>
  value.replace(/([?&]access_token=)[^&\s]+/g, "$1[redacted]");

const serializeErrorForLog = (error: unknown) => {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: redactAccessTokens(error.message)
    };
  }

  return {
    message: redactAccessTokens(String(error))
  };
};

const loadInstagramFeed = async (): Promise<{
  items: SocialContentItem[];
  hasError: boolean;
}> => {
  try {
    const items = (await fetchInstagramContent(5)).slice(0, 5);
    const mediaTypes = items.reduce<Record<string, number>>((counts, item) => {
      const mediaType = item.mediaType ?? "UNKNOWN";
      counts[mediaType] = (counts[mediaType] ?? 0) + 1;
      return counts;
    }, {});

    console.info("[acroxtv-feed] Instagram refresh", {
      itemCount: items.length,
      mediaTypes
    });

    return {
      items,
      hasError: false
    };
  } catch (error) {
    console.error("[acroxtv-feed] Instagram fetch failed", serializeErrorForLog(error));
    throw error;
  }
};

export async function GET() {
  let youtubeData: Awaited<ReturnType<typeof fetchAcroxTvYouTubeFeed>> = {
    liveItem: null,
    latestEpisode: null,
    topEpisode: null,
    episodes: [],
    warnings: [],
    hasError: false
  };
  let youtubeError = false;

  try {
    youtubeData = await fetchAcroxTvYouTubeFeed();
    youtubeError = youtubeData.hasError;
  } catch {
    youtubeError = true;
  }

  let instagramItems: SocialContentItem[] = [];
  let instagramError = false;

  try {
    const instagram = await getSWRResource({
      key: INSTAGRAM_CACHE_KEY,
      ttlMs: INSTAGRAM_TTL_MS,
      staleMs: INSTAGRAM_STALE_MS,
      load: loadInstagramFeed
    });
    const primedInstagram = await primeInstagramAssetCache(instagram.value.items);
    instagramItems = primedInstagram.items;
    instagramError = instagram.value.hasError || instagram.state === "snapshot";

    console.info("[acroxtv-feed] Instagram assets", {
      itemCount: instagram.value.items.length,
      proxiedCount: primedInstagram.proxiedCount,
      failedCount: primedInstagram.failedCount,
      cacheState: instagram.state
    });
  } catch (error) {
    console.error(
      "[acroxtv-feed] Instagram unavailable without snapshot",
      serializeErrorForLog(error)
    );
    instagramError = true;
  }

  const payload: AcroxTvFeedResponse = {
    liveItem: youtubeData.liveItem,
    latestEpisode: youtubeData.latestEpisode,
    topEpisode: youtubeData.topEpisode,
    episodes: youtubeData.episodes,
    instagram: instagramItems,
    youtubeError,
    instagramError
  };

  return NextResponse.json(payload, {
    status: 200,
    headers: {
      "Cache-Control": "private, no-store, max-age=0"
    }
  });
}
