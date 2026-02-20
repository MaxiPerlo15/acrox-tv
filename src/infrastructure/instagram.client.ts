import { env } from "@/lib/env";
import type { SocialContentItem } from "@/domain/social-content";

type InstagramMediaResponse = {
  data?: Array<{
    id?: string;
    permalink?: string;
    media_url?: string;
    caption?: string;
    timestamp?: string;
  }>;
};

export const fetchInstagramContent = async (limit: number): Promise<SocialContentItem[]> => {
  if (!env.instagramAccessToken || !env.instagramUserId) {
    return [];
  }

  const params = new URLSearchParams({
    fields: "id,caption,media_url,permalink,timestamp",
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
      if (!item.id || !item.permalink || !item.media_url || !item.timestamp) {
        return null;
      }

      return {
        id: `instagram-${item.id}`,
        platform: "instagram",
        title: item.caption?.slice(0, 80) ?? "Nuevo contenido de Instagram",
        url: item.permalink,
        thumbnailUrl: item.media_url,
        publishedAt: item.timestamp
      } satisfies SocialContentItem;
    })
    .filter((item): item is SocialContentItem => item !== null);
};
