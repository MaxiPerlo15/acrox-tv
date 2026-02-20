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
