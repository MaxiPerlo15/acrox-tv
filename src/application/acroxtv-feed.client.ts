import type { AcroxTvFeedResponse } from "@/domain/acroxtv-feed";

let inFlightFeedRequest: Promise<AcroxTvFeedResponse> | null = null;

const EMPTY_FEED: AcroxTvFeedResponse = {
  liveItem: null,
  latestEpisode: null,
  topEpisode: null,
  episodes: [],
  instagram: [],
  youtubeError: true,
  instagramError: true
};

export const loadAcroxTvFeedClient = async (): Promise<AcroxTvFeedResponse> => {
  if (inFlightFeedRequest) {
    return inFlightFeedRequest;
  }

  inFlightFeedRequest = fetch("/api/acroxtv-feed", {
    method: "GET",
    cache: "no-store"
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`acroxtv-feed status ${response.status}`);
      }
      return (await response.json()) as AcroxTvFeedResponse;
    })
    .catch(() => EMPTY_FEED)
    .finally(() => {
      inFlightFeedRequest = null;
    });

  return inFlightFeedRequest;
};
