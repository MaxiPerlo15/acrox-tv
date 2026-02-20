export type SocialPlatform = "youtube" | "instagram";

export type SocialContentItem = {
  id: string;
  platform: SocialPlatform;
  title: string;
  url: string;
  thumbnailUrl: string;
  publishedAt: string;
};

export type SocialFeedResult = {
  items: SocialContentItem[];
  source: "live" | "fallback";
  warnings: string[];
};

export const FALLBACK_SOCIAL_ITEMS: SocialContentItem[] = [
  {
    id: "yt-fallback-1",
    platform: "youtube",
    title: "Ultimas producciones de Acrox TV",
    url: "https://www.youtube.com",
    thumbnailUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    publishedAt: "2026-01-01T00:00:00.000Z"
  },
  {
    id: "ig-fallback-1",
    platform: "instagram",
    title: "Detras de escena y contenido reciente",
    url: "https://www.instagram.com",
    thumbnailUrl: "https://i.ytimg.com/vi/ScMzIvxBSi4/hqdefault.jpg",
    publishedAt: "2026-01-02T00:00:00.000Z"
  }
];
