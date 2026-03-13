import { env } from "@/lib/env";
import type { SocialContentItem } from "@/domain/social-content";

type InstagramMediaResponse = {
  data?: Array<{
    id?: string;
    permalink?: string;
    media_url?: string;
    thumbnail_url?: string;
    media_type?: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
    caption?: string;
    timestamp?: string;
  }>;
};

export const fetchInstagramContent = async (limit: number): Promise<SocialContentItem[]> => {
  if (!env.instagramAccessToken || !env.instagramUserId) {
    return [];
  }

  const params = new URLSearchParams({
    fields: "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp",
    access_token: env.instagramAccessToken,
    limit: String(limit)
  });

  const response = await fetch(
    `https://graph.instagram.com/${env.instagramUserId}/media?${params.toString()}`,
    { next: { revalidate: 300 } }
  );

  if (!response.ok) {
    throw new Error(`Instagram API error: ${response.status}`);
  }

  const data = (await response.json()) as InstagramMediaResponse;
  const items = data.data ?? [];

  return items
    .map<SocialContentItem | null>((item) => {
      if (!item.id || !item.permalink || !item.timestamp) {
        return null;
      }

      // For video/reels, media_url can be an MP4. next/image requires an image URL.
      const thumbnailUrl =
        item.media_type === "VIDEO"
          ? (item.thumbnail_url ?? "")
          : (item.media_url ?? item.thumbnail_url ?? "");

      if (!thumbnailUrl) {
        return null;
      }

      return {
        id: `instagram-${item.id}`,
        platform: "instagram",
        title: item.caption?.replace(/\s+/g, " ").trim() || "Nuevo contenido de Instagram",
        url: item.permalink,
        thumbnailUrl,
        publishedAt: item.timestamp,
        previewVideoUrl: item.media_type === "VIDEO" ? item.media_url : undefined
      } satisfies SocialContentItem;
    })
    .filter((item): item is SocialContentItem => item !== null);
};
