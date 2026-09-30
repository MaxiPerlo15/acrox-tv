export type YouTubeThumbnailSet = {
  maxres?: { url?: string };
  standard?: { url?: string };
  high?: { url?: string };
  medium?: { url?: string };
  default?: { url?: string };
};

export const selectYouTubeThumbnail = (thumbnails?: YouTubeThumbnailSet): string => {
  for (const quality of ["maxres", "standard", "high", "medium", "default"] as const) {
    const url = thumbnails?.[quality]?.url;
    if (url) return url;
  }

  return "";
};
