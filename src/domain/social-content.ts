export type SocialPlatform = "youtube" | "instagram";

export type SocialContentItem = {
  id: string;
  platform: SocialPlatform;
  title: string;
  url: string;
  thumbnailUrl: string;
  publishedAt: string;
  previewVideoUrl?: string;
};
