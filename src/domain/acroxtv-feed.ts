import type { SocialContentItem } from "@/domain/social-content";

export type EpisodeItem = {
  videoId: string;
  title: string;
  watchUrl: string;
  thumbnailUrl: string;
  publishedAt: string;
  durationSeconds: number;
  viewCount: number;
};

export type LiveItem = {
  videoId: string;
  title: string;
  publishedAt: string;
  thumbnailUrl: string;
  watchUrl: string;
  isLive: true;
};

export type AcroxTvFeedResponse = {
  liveItem: LiveItem | null;
  latestEpisode: EpisodeItem | null;
  topEpisode: EpisodeItem | null;
  episodes: EpisodeItem[];
  instagram: SocialContentItem[];
  youtubeError: boolean;
  instagramError: boolean;
};
