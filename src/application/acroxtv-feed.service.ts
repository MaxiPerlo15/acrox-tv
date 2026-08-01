import "server-only";

import type { EpisodeItem, ProgramFeedResponse } from "@/domain/acroxtv-feed";
import { isProgramSlug, type ProgramSlug } from "@/domain/programs";
import { env } from "@/lib/env";
import { PROGRAM_MEDIA_SOURCES, type ProgramYouTubeSource } from "@/infrastructure/program-media-sources";
import { getSWRResource, type SWRStore } from "@/infrastructure/swr-cache";
import { fetchProgramYouTubeFeed } from "@/infrastructure/youtube.client";

const PROGRAM_CACHE_TTL_MS = 30 * 60 * 1000;
const PROGRAM_CACHE_STALE_MS = 72 * 60 * 60 * 1000;

type ProgramFeedDependencies = {
  fetchEpisodes?: (source: ProgramYouTubeSource) => Promise<EpisodeItem[]>;
  store?: SWRStore;
  now?: () => number;
};

const cacheKey = (slug: ProgramSlug) =>
  `yt:program:${slug}:playlist:${PROGRAM_MEDIA_SOURCES[slug].youtube.playlistId}`;

export const createProgramFeedService = ({
  fetchEpisodes = fetchProgramYouTubeFeed,
  store,
  now = Date.now
}: ProgramFeedDependencies = {}) => ({
  async get(slug: string): Promise<ProgramFeedResponse | null> {
    if (!isProgramSlug(slug)) return null;

    const unavailable = {
      programSlug: slug,
      episodes: { state: "unavailable" as const },
      instagram: { state: "unavailable" as const },
      live: { state: "unavailable" as const }
    };
    if (!env.youtubeApiKey) return unavailable;

    try {
      const resource = await getSWRResource(
        {
          key: cacheKey(slug),
          ttlMs: PROGRAM_CACHE_TTL_MS,
          staleMs: PROGRAM_CACHE_STALE_MS,
          load: () => fetchEpisodes(PROGRAM_MEDIA_SOURCES[slug].youtube),
          now
        },
        store
      );
      const asOf = new Date(resource.updatedAt).toISOString();

      return {
        programSlug: slug,
        episodes:
          resource.state === "stale" || resource.state === "snapshot"
            ? { state: "stale", items: resource.value, asOf }
            : { state: "available", items: resource.value, asOf },
        instagram: { state: "unavailable" },
        live: { state: "unavailable" }
      };
    } catch {
      return {
        programSlug: slug,
        episodes: { state: "error" },
        instagram: { state: "unavailable" },
        live: { state: "unavailable" }
      };
    }
  }
});
