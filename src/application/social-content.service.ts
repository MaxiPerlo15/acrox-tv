import {
  FALLBACK_SOCIAL_ITEMS,
  type SocialContentItem,
  type SocialFeedResult
} from "@/domain/social-content";
import { fetchInstagramContent } from "@/infrastructure/instagram.client";
import { fetchYouTubeContent } from "@/infrastructure/youtube.client";

const wait = async (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const withRetry = async <T>(fn: () => Promise<T>, retries = 2, baseDelayMs = 500): Promise<T> => {
  let attempt = 0;
  let error: unknown;

  while (attempt <= retries) {
    try {
      return await fn();
    } catch (err) {
      error = err;
      if (attempt === retries) break;
      await wait(baseDelayMs * (attempt + 1));
      attempt += 1;
    }
  }

  throw error;
};

export const getLatestSocialContent = async (): Promise<SocialFeedResult> => {
  const warnings: string[] = [];

  const [youtubeResult, instagramResult] = await Promise.allSettled([
    withRetry(() => fetchYouTubeContent(6)),
    withRetry(() => fetchInstagramContent(6))
  ]);

  const items: SocialContentItem[] = [];

  if (youtubeResult.status === "fulfilled") {
    items.push(...youtubeResult.value);
  } else {
    warnings.push("No pudimos leer YouTube en este momento.");
  }

  if (instagramResult.status === "fulfilled") {
    items.push(...instagramResult.value);
  } else {
    warnings.push("No pudimos leer Instagram en este momento.");
  }

  if (items.length === 0) {
    return {
      items: FALLBACK_SOCIAL_ITEMS,
      source: "fallback",
      warnings: warnings.length > 0 ? warnings : ["Mostrando contenido de respaldo temporal."]
    };
  }

  const sorted = items.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return {
    items: sorted,
    source: "live",
    warnings
  };
};
