export type YouTubeThumbnails = {
  maxres?: { url?: string };
  standard?: { url?: string };
  high?: { url?: string };
  medium?: { url?: string };
  default?: { url?: string };
};

export const selectYouTubeThumbnail = (thumbnails: YouTubeThumbnails): string =>
  thumbnails.maxres?.url ||
  thumbnails.standard?.url ||
  thumbnails.high?.url ||
  thumbnails.medium?.url ||
  thumbnails.default?.url ||
  "";
