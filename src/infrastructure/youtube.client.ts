import { env } from "@/lib/env";
import type { SocialContentItem } from "@/domain/social-content";

type YouTubeSearchResponse = {
  items?: Array<{
    id?: { videoId?: string };
    snippet?: {
      title?: string;
      publishedAt?: string;
      thumbnails?: {
        medium?: { url?: string };
        high?: { url?: string };
      };
    };
  }>;
};

export type YouTubeLiveVideo = {
  videoId: string;
  title: string;
  publishedAt: string;
  thumbnailUrl: string;
  isLive: boolean;
  watchUrl: string;
};

export const fetchYouTubeContent = async (limit: number): Promise<SocialContentItem[]> => {
  if (!env.youtubeApiKey || !env.youtubeChannelId) {
    return [];
  }

  const params = new URLSearchParams({
    key: env.youtubeApiKey,
    channelId: env.youtubeChannelId,
    part: "snippet",
    order: "date",
    type: "video",
    maxResults: String(limit)
  });

  const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params.toString()}`, {
    next: { revalidate: 300 }
  });

  if (!response.ok) {
    throw new Error(`YouTube API error: ${response.status}`);
  }

  const data = (await response.json()) as YouTubeSearchResponse;
  const items = data.items ?? [];

  return items
    .map<SocialContentItem | null>((item) => {
      const videoId = item.id?.videoId;
      const snippet = item.snippet;
      if (!videoId || !snippet?.title || !snippet.publishedAt) {
        return null;
      }

      return {
        id: `youtube-${videoId}`,
        platform: "youtube",
        title: snippet.title,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnailUrl: snippet.thumbnails?.high?.url ?? snippet.thumbnails?.medium?.url ?? "",
        publishedAt: snippet.publishedAt
      } satisfies SocialContentItem;
    })
    .filter((item): item is SocialContentItem => item !== null && item.thumbnailUrl.length > 0);
};

const mapYouTubeVideo = (
  item: NonNullable<YouTubeSearchResponse["items"]>[number],
  isLive: boolean
): YouTubeLiveVideo | null => {
  const videoId = item.id?.videoId;
  const snippet = item.snippet;
  if (!videoId || !snippet?.title || !snippet.publishedAt) {
    return null;
  }

  const thumbnailUrl = snippet.thumbnails?.high?.url ?? snippet.thumbnails?.medium?.url ?? "";
  if (!thumbnailUrl) {
    return null;
  }

  return {
    videoId,
    title: snippet.title,
    publishedAt: snippet.publishedAt,
    thumbnailUrl,
    isLive,
    watchUrl: `https://www.youtube.com/watch?v=${videoId}`
  };
};

export const fetchYouTubeLiveOrLatestVideo = async (): Promise<YouTubeLiveVideo | null> => {
  if (!env.youtubeApiKey || !env.youtubeChannelId) {
    return null;
  }

  const liveParams = new URLSearchParams({
    key: env.youtubeApiKey,
    channelId: env.youtubeChannelId,
    part: "snippet",
    eventType: "live",
    type: "video",
    maxResults: "1"
  });

  const liveResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/search?${liveParams.toString()}`,
    { next: { revalidate: 60 } }
  );

  if (!liveResponse.ok) {
    throw new Error(`YouTube live API error: ${liveResponse.status}`);
  }

  const liveData = (await liveResponse.json()) as YouTubeSearchResponse;
  const liveItem = liveData.items?.[0];
  const parsedLive = liveItem ? mapYouTubeVideo(liveItem, true) : null;
  if (parsedLive) {
    return parsedLive;
  }

  const latestParams = new URLSearchParams({
    key: env.youtubeApiKey,
    channelId: env.youtubeChannelId,
    part: "snippet",
    order: "date",
    type: "video",
    maxResults: "1"
  });

  const latestResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/search?${latestParams.toString()}`,
    { next: { revalidate: 300 } }
  );

  if (!latestResponse.ok) {
    throw new Error(`YouTube latest API error: ${latestResponse.status}`);
  }

  const latestData = (await latestResponse.json()) as YouTubeSearchResponse;
  const latestItem = latestData.items?.[0];
  return latestItem ? mapYouTubeVideo(latestItem, false) : null;
};
