export type SocialPlatform = "youtube" | "instagram";

export type SocialContentItem = {
  id: string;
  platform: SocialPlatform;
  title: string;
  url: string;
  thumbnailUrl: string;
  publishedAt: string;
  mediaType?: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  previewVideoUrl?: string;
};
