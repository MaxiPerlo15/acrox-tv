import { env } from "@/lib/env";
import type { EpisodeItem, LiveItem } from "@/domain/acroxtv-feed";
import { selectYouTubeThumbnail, type YouTubeThumbnailSet } from "@/domain/youtube-thumbnails";
import { getSWRResource } from "@/infrastructure/swr-cache";

type YouTubeSearchResponse = {
  items?: Array<{
    id?: { videoId?: string };
    snippet?: {
      title?: string;
      publishedAt?: string;
      thumbnails?: YouTubeThumbnailSet;
    };
  }>;
};

type YouTubeVideoDetailsWithStatsResponse = {
  items?: Array<{
    id?: string;
    snippet?: {
      title?: string;
      publishedAt?: string;
      thumbnails?: YouTubeThumbnailSet;
    };
    contentDetails?: {
      duration?: string;
    };
    liveStreamingDetails?: {
      actualStartTime?: string;
    };
    statistics?: {
      viewCount?: string;
    };
  }>;
};

type YouTubeApiErrorResponse = {
  error?: {
    code?: number;
    message?: string;
    errors?: Array<{
      reason?: string;
      message?: string;
    }>;
  };
};

type YouTubePlaylistItemsResponse = {
  items?: Array<{
    contentDetails?: {
      videoId?: string;
    };
  }>;
};

export class YouTubeApiError extends Error {
  readonly status: number;
  readonly reason?: string;

  constructor(message: string, status: number, reason?: string) {
    super(message);
    this.name = "YouTubeApiError";
    this.status = status;
    this.reason = reason;
  }
}

const throwYouTubeApiError = async (response: Response, context: string): Promise<never> => {
  let reason: string | undefined;
  let message = `YouTube API error (${context}): ${response.status}`;

  try {
    const data = (await response.json()) as YouTubeApiErrorResponse;
    reason = data.error?.errors?.[0]?.reason;
    const apiMessage = data.error?.message;
    if (reason) {
      message = `YouTube API error (${context}): ${response.status} [${reason}]`;
    }
    if (apiMessage) {
      message = `${message} - ${apiMessage}`;
    }
  } catch {
    // Keep default message when provider body cannot be parsed.
  }

  if (reason === "quotaExceeded") {
    quotaBlockedUntil = Date.now() + YOUTUBE_QUOTA_COOLDOWN_MS;
  }

  throw new YouTubeApiError(message, response.status, reason);
};

type YouTubeVideoDetails = {
  videoId: string;
  title: string;
  publishedAt: string;
  thumbnailUrl: string;
  durationSeconds: number;
  actualStartTime?: string;
};

const STREAM_MIN_DURATION_SECONDS = 60 * 60;
const YOUTUBE_QUOTA_COOLDOWN_MS = 60 * 60 * 1000;
const YOUTUBE_ACROXTV_LIVE_CACHE_TTL_MS = 5 * 60 * 1000;
const YOUTUBE_ACROXTV_LIVE_STALE_MS = 24 * 60 * 60 * 1000;
const YOUTUBE_ACROXTV_PROGRAM_CACHE_TTL_MS = 30 * 60 * 1000;
const YOUTUBE_ACROXTV_PROGRAM_STALE_MS = 72 * 60 * 60 * 1000;
const YOUTUBE_ACROXTV_LIVE_REFRESH_CRITICAL_MS = 10 * 60 * 1000;
const YOUTUBE_ACROXTV_LIVE_REFRESH_IDLE_MS = 6 * 60 * 60 * 1000;
const YOUTUBE_ACROXTV_PROGRAM_REFRESH_MS = 12 * 60 * 60 * 1000;
const ACROX_TV_LIVE_CACHE_KEY = "yt:acroxtv:live";
const ACROX_TV_PROGRAM_CACHE_KEY = "yt:acroxtv:program";

let quotaBlockedUntil = 0;

const isQuotaBlocked = (): boolean => Date.now() < quotaBlockedUntil;

const clearQuotaCooldown = () => {
  quotaBlockedUntil = 0;
};

const getCordobaFridayWindow = () => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Argentina/Cordoba",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
  const parts = formatter.formatToParts(new Date());
  const weekday = parts.find((part) => part.type === "weekday")?.value ?? "";
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? "0");
  const minutesOfDay = hour * 60 + minute;

  // Friday 19:50–22:30 Argentina/Cordoba
  const isFriday = weekday.toLowerCase().startsWith("fri");
  const isWindow = isFriday && minutesOfDay >= 19 * 60 + 50 && minutesOfDay <= 22 * 60 + 30;
  return {
    isWindow
  };
};

const getLiveRefreshIntervalMs = () =>
  (getCordobaFridayWindow().isWindow
    ? YOUTUBE_ACROXTV_LIVE_REFRESH_CRITICAL_MS
    : YOUTUBE_ACROXTV_LIVE_REFRESH_IDLE_MS);

const createQuotaExceededError = (context: string): YouTubeApiError =>
  new YouTubeApiError(
    `YouTube API error (${context}): 403 [quotaExceeded] - quota cooldown active`,
    403,
    "quotaExceeded"
  );

const parseYouTubeDurationToSeconds = (isoDuration?: string): number => {
  if (!isoDuration) return 0;
  const match = isoDuration.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!match) return 0;

  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const seconds = Number(match[3] ?? 0);
  return hours * 3600 + minutes * 60 + seconds;
};

const mapDetailsToEpisode = (item: YouTubeVideoDetails, viewCount: number): EpisodeItem => ({
  videoId: item.videoId,
  title: item.title,
  watchUrl: `https://www.youtube.com/watch?v=${item.videoId}`,
  thumbnailUrl: item.thumbnailUrl,
  publishedAt: item.publishedAt,
  durationSeconds: item.durationSeconds,
  viewCount
});

const fetchCurrentYouTubeLive = async (): Promise<LiveItem | null> => {
  if (!env.youtubeApiKey || !env.youtubeChannelId) {
    return null;
  }

  const liveParams = new URLSearchParams({
    key: env.youtubeApiKey,
    channelId: env.youtubeChannelId,
    part: "snippet",
    eventType: "live",
    type: "video",
    maxResults: "1"
  });

  if (isQuotaBlocked()) {
    throw createQuotaExceededError("search-live-feed");
  }

  const liveResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/search?${liveParams.toString()}`,
    { cache: "no-store" }
  );
  if (!liveResponse.ok) {
    await throwYouTubeApiError(liveResponse, "search-live-feed");
  }
  clearQuotaCooldown();

  const liveData = (await liveResponse.json()) as YouTubeSearchResponse;
  const liveItem = liveData.items?.[0];
  const videoId = liveItem?.id?.videoId;
  const snippet = liveItem?.snippet;
  const thumbnailUrl = selectYouTubeThumbnail(snippet?.thumbnails);
  if (!videoId || !snippet?.title || !snippet.publishedAt || !thumbnailUrl) {
    return null;
  }

  return {
    videoId,
    title: snippet.title,
    publishedAt: snippet.publishedAt,
    thumbnailUrl,
    watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
    isLive: true
  };
};

const fetchPlaylistVideoIds = async (playlistId: string): Promise<string[]> => {
  if (!env.youtubeApiKey) return [];
  if (isQuotaBlocked()) {
    throw createQuotaExceededError("playlist-items");
  }

  const params = new URLSearchParams({
    key: env.youtubeApiKey,
    playlistId,
    part: "contentDetails",
    maxResults: "50"
  });

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?${params.toString()}`,
    { cache: "no-store" }
  );
  if (!response.ok) {
    await throwYouTubeApiError(response, "playlist-items");
  }
  clearQuotaCooldown();

  const data = (await response.json()) as YouTubePlaylistItemsResponse;
  return (data.items ?? [])
    .map((item) => item.contentDetails?.videoId)
    .filter((videoId): videoId is string => Boolean(videoId));
};

const fetchYouTubeVideoDetailsWithStats = async (
  videoIds: string[]
): Promise<Array<YouTubeVideoDetails & { viewCount: number }>> => {
  if (videoIds.length === 0 || !env.youtubeApiKey) return [];
  if (isQuotaBlocked()) {
    throw createQuotaExceededError("videos-playlist-details");
  }

  const detailsParams = new URLSearchParams({
    key: env.youtubeApiKey,
    id: videoIds.join(","),
    part: "snippet,contentDetails,statistics,liveStreamingDetails",
    maxResults: String(videoIds.length)
  });

  const detailsResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?${detailsParams.toString()}`,
    { cache: "no-store" }
  );
  if (!detailsResponse.ok) {
    await throwYouTubeApiError(detailsResponse, "videos-playlist-details");
  }
  clearQuotaCooldown();

  const detailsData = (await detailsResponse.json()) as YouTubeVideoDetailsWithStatsResponse;

  return (detailsData.items ?? [])
    .map<Array<YouTubeVideoDetails & { viewCount: number }>[number] | null>((item) => {
      const videoId = item.id;
      const title = item.snippet?.title;
      const publishedAt = item.snippet?.publishedAt;
      const thumbnailUrl = selectYouTubeThumbnail(item.snippet?.thumbnails);
      const durationSeconds = parseYouTubeDurationToSeconds(item.contentDetails?.duration);
      const viewCount = Number(item.statistics?.viewCount ?? 0);

      if (!videoId || !title || !publishedAt || !thumbnailUrl) {
        return null;
      }

      return {
        videoId,
        title,
        publishedAt,
        thumbnailUrl,
        durationSeconds,
        viewCount,
        actualStartTime: item.liveStreamingDetails?.actualStartTime
      };
    })
    .filter((item): item is YouTubeVideoDetails & { viewCount: number } => item !== null);
};

type LiveDiscoveryResource = {
  liveItem: LiveItem | null;
  discoveredAt: number;
  nextRefreshAt: number;
};

type ProgramFeedResource = {
  latestEpisode: EpisodeItem | null;
  topEpisode: EpisodeItem | null;
  episodes: EpisodeItem[];
  refreshedAt: number;
  nextRefreshAt: number;
};

const loadLiveDiscovery = async (): Promise<LiveDiscoveryResource> => {
  const liveItem = await fetchCurrentYouTubeLive();
  const now = Date.now();
  return {
    liveItem,
    discoveredAt: now,
    nextRefreshAt: now + getLiveRefreshIntervalMs()
  };
};

const loadProgramFeed = async (): Promise<ProgramFeedResource> => {
  if (!env.youtubePlaylistId) {
    const now = Date.now();
    return {
      latestEpisode: null,
      topEpisode: null,
      episodes: [],
      refreshedAt: now,
      nextRefreshAt: now + YOUTUBE_ACROXTV_PROGRAM_REFRESH_MS
    };
  }

  const videoIds = await fetchPlaylistVideoIds(env.youtubePlaylistId);
  const details = await fetchYouTubeVideoDetailsWithStats(videoIds.slice(0, 50));

  const streamEpisodes = details
    .filter((item) => item.durationSeconds >= STREAM_MIN_DURATION_SECONDS)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const latestEpisode = streamEpisodes[0]
    ? mapDetailsToEpisode(streamEpisodes[0], streamEpisodes[0].viewCount)
    : null;

  const topEpisodeSource = [...streamEpisodes].sort((a, b) => {
    if (b.viewCount !== a.viewCount) return b.viewCount - a.viewCount;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  })[0];
  const topEpisode = topEpisodeSource
    ? mapDetailsToEpisode(topEpisodeSource, topEpisodeSource.viewCount)
    : null;

  const episodes = streamEpisodes
    .slice(0, 5)
    .map((item) => mapDetailsToEpisode(item, item.viewCount));
  const now = Date.now();

  return {
    latestEpisode,
    topEpisode,
    episodes,
    refreshedAt: now,
    nextRefreshAt: now + YOUTUBE_ACROXTV_PROGRAM_REFRESH_MS
  };
};

export const fetchAcroxTvYouTubeFeed = async (): Promise<{
  liveItem: LiveItem | null;
  latestEpisode: EpisodeItem | null;
  topEpisode: EpisodeItem | null;
  episodes: EpisodeItem[];
  warnings: string[];
  hasError: boolean;
}> => {
  if (!env.youtubeApiKey || !env.youtubeChannelId) {
    return {
      liveItem: null,
      latestEpisode: null,
      topEpisode: null,
      episodes: [],
      warnings: ["YouTube API no configurada."],
      hasError: true
    };
  }

  const warnings: string[] = [];
  let hasError = false;
  let liveValue: LiveDiscoveryResource = {
    liveItem: null,
    discoveredAt: 0,
    nextRefreshAt: 0
  };
  let programValue: ProgramFeedResource = {
    latestEpisode: null,
    topEpisode: null,
    episodes: [],
    refreshedAt: 0,
    nextRefreshAt: 0
  };

  try {
    const live = await getSWRResource({
      key: ACROX_TV_LIVE_CACHE_KEY,
      ttlMs: YOUTUBE_ACROXTV_LIVE_CACHE_TTL_MS,
      staleMs: YOUTUBE_ACROXTV_LIVE_STALE_MS,
      load: loadLiveDiscovery,
      shouldRefresh: ({ now, entry }) => now >= entry.value.nextRefreshAt
    });
    liveValue = live.value;
    if (live.state === "snapshot") {
      warnings.push("Mostrando estado live cacheado por falla temporal de YouTube.");
    }
  } catch (error) {
    hasError = true;
    if (error instanceof YouTubeApiError && error.reason === "quotaExceeded") {
      quotaBlockedUntil = Date.now() + YOUTUBE_QUOTA_COOLDOWN_MS;
      warnings.push("YouTube live sin datos por cuota excedida.");
    } else {
      warnings.push("YouTube live sin datos por error de API.");
    }
  }

  try {
    const program = await getSWRResource({
      key: ACROX_TV_PROGRAM_CACHE_KEY,
      ttlMs: YOUTUBE_ACROXTV_PROGRAM_CACHE_TTL_MS,
      staleMs: YOUTUBE_ACROXTV_PROGRAM_STALE_MS,
      load: loadProgramFeed,
      shouldRefresh: ({ now, entry }) => now >= entry.value.nextRefreshAt
    });
    programValue = program.value;
    if (program.state === "snapshot") {
      warnings.push("Mostrando episodios cacheados por falla temporal de YouTube.");
    }
  } catch (error) {
    hasError = true;
    if (error instanceof YouTubeApiError && error.reason === "quotaExceeded") {
      quotaBlockedUntil = Date.now() + YOUTUBE_QUOTA_COOLDOWN_MS;
      warnings.push("YouTube episodios sin datos por cuota excedida.");
    } else {
      warnings.push("YouTube episodios sin datos por error de API.");
    }
  }

  return {
    liveItem: liveValue.liveItem,
    latestEpisode: programValue.latestEpisode,
    topEpisode: programValue.topEpisode,
    episodes: programValue.episodes,
    warnings,
    hasError
  };
};
