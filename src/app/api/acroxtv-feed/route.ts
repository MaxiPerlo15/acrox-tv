import { NextResponse } from "next/server";
import type { AcroxTvFeedResponse } from "@/domain/acroxtv-feed";
import type { SocialContentItem } from "@/domain/social-content";
import { fetchInstagramContent } from "@/infrastructure/instagram.client";
import { fetchAcroxTvYouTubeFeed } from "@/infrastructure/youtube.client";
import { getSWRResource } from "@/infrastructure/swr-cache";

export const revalidate = 300;
const INSTAGRAM_CACHE_KEY = "ig:acroxtv:feed";
const INSTAGRAM_TTL_MS = 30 * 60 * 1000;
const INSTAGRAM_STALE_MS = 24 * 60 * 60 * 1000;

const loadInstagramFeed = async (): Promise<{
  items: SocialContentItem[];
  hasError: boolean;
}> => {
  try {
    const items = (await fetchInstagramContent(5)).slice(0, 5);
    return {
      items,
      hasError: false
    };
  } catch {
    return {
      items: [],
      hasError: true
    };
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

  const instagram = await getSWRResource({
    key: INSTAGRAM_CACHE_KEY,
    ttlMs: INSTAGRAM_TTL_MS,
    staleMs: INSTAGRAM_STALE_MS,
    load: loadInstagramFeed
  });

  const payload: AcroxTvFeedResponse = {
    liveItem: youtubeData.liveItem,
    latestEpisode: youtubeData.latestEpisode,
    topEpisode: youtubeData.topEpisode,
    episodes: youtubeData.episodes,
    instagram: instagram.value.items,
    youtubeError,
    instagramError: instagram.value.hasError
  };

  return NextResponse.json(payload, {
    status: 200,
    headers: {
      "Cache-Control": "private, no-store, max-age=0"
    }
  });
}
