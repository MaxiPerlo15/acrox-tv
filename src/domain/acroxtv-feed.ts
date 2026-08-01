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

export type SourceState = "available" | "unavailable" | "stale" | "error";

export type MediaSurface<T> =
  | { state: "available"; items: T; asOf: string }
  | { state: "stale"; items: T; asOf: string }
  | { state: "unavailable" }
  | { state: "error" };

export type ProgramFeedResponse = {
  programSlug: string;
  episodes: MediaSurface<EpisodeItem[]>;
  instagram: MediaSurface<SocialContentItem[]>;
  live: MediaSurface<LiveItem | null>;
};
