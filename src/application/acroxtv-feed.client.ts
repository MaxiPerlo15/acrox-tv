import type { AcroxTvFeedResponse, ProgramFeedResponse } from "@/domain/acroxtv-feed";

let inFlightFeedRequest: Promise<AcroxTvFeedResponse> | null = null;
const inFlightProgramFeedRequests = new Map<string, Promise<ProgramFeedResponse>>();

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

const emptyProgramFeed = (programSlug: string): ProgramFeedResponse => ({
  programSlug,
  episodes: { state: "error" },
  instagram: { state: "error" },
  live: { state: "error" }
});

export const loadProgramFeedClient = async (programSlug: string): Promise<ProgramFeedResponse> => {
  const inFlightRequest = inFlightProgramFeedRequests.get(programSlug);
  if (inFlightRequest) return inFlightRequest;

  const request = fetch(`/api/acroxtv-feed/${programSlug}`, {
    method: "GET",
    cache: "no-store"
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`acroxtv-feed status ${response.status}`);
      }
      return (await response.json()) as ProgramFeedResponse;
    })
    .catch(() => emptyProgramFeed(programSlug))
    .finally(() => {
      inFlightProgramFeedRequests.delete(programSlug);
    });

  inFlightProgramFeedRequests.set(programSlug, request);
  return request;
};
