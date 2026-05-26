import type { SocialContentItem } from "@/domain/social-content";

const INSTAGRAM_ASSET_HOST_PATTERNS = [
  "scontent.cdninstagram.com",
  ".cdninstagram.com",
  "lookaside.instagram.com",
  ".fbcdn.net"
] as const;

const INSTAGRAM_ASSET_TTL_MS = 30 * 60 * 1000;

type CachedInstagramAsset = {
  body: Uint8Array;
  contentType: string;
  contentLength?: string;
  etag?: string;
  lastModified?: string;
  cachedAt: number;
  expiresAt: number;
};

type InstagramAssetPrimeResult = {
  items: SocialContentItem[];
  proxiedCount: number;
  failedCount: number;
};

const assetStore = new Map<string, CachedInstagramAsset>();

const isAllowedInstagramAssetHost = (hostname: string): boolean =>
  INSTAGRAM_ASSET_HOST_PATTERNS.some((pattern) =>
    pattern.startsWith(".") ? hostname.endsWith(pattern) : hostname === pattern
  );

export const isAllowedInstagramAssetUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && isAllowedInstagramAssetHost(url.hostname);
  } catch {
    return false;
  }
};

export const buildInstagramAssetProxyUrl = (assetId: string): string =>
  `/api/instagram-image?id=${encodeURIComponent(assetId)}`;

export const getCachedInstagramAsset = (assetId: string): CachedInstagramAsset | null => {
  const entry = assetStore.get(assetId);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    assetStore.delete(assetId);
    return null;
  }

  return entry;
};

export const primeInstagramAssetCache = async (items: SocialContentItem[]): Promise<InstagramAssetPrimeResult> => {
  let proxiedCount = 0;
  let failedCount = 0;

  const prepared = await Promise.all(
    items.map(async (item) => {
      if (!isAllowedInstagramAssetUrl(item.thumbnailUrl)) {
        return item;
      }

      const existing = getCachedInstagramAsset(item.id);
      if (existing) {
        proxiedCount += 1;
        return {
          ...item,
          thumbnailUrl: buildInstagramAssetProxyUrl(item.id)
        } satisfies SocialContentItem;
      }

      try {
        const response = await fetch(item.thumbnailUrl, {
          cache: "no-store"
        });

        if (!response.ok) {
          const body = await response.text().catch(() => "");
          failedCount += 1;
          console.error("[instagram-image] Prime rejected asset", response.status, body.slice(0, 400));
          return item;
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !response.body) {
          failedCount += 1;
          console.error("[instagram-image] Prime missing body or content-type");
          return item;
        }

        const body = new Uint8Array(await response.arrayBuffer());
        const now = Date.now();

        assetStore.set(item.id, {
          body,
          contentType,
          contentLength: response.headers.get("content-length") ?? String(body.byteLength),
          etag: response.headers.get("etag") ?? undefined,
          lastModified: response.headers.get("last-modified") ?? undefined,
          cachedAt: now,
          expiresAt: now + INSTAGRAM_ASSET_TTL_MS
        });

        proxiedCount += 1;
        return {
          ...item,
          thumbnailUrl: buildInstagramAssetProxyUrl(item.id)
        } satisfies SocialContentItem;
      } catch (error) {
        failedCount += 1;
        console.error("[instagram-image] Prime fetch failed", error);
        return item;
      }
    })
  );

  return {
    items: prepared,
    proxiedCount,
    failedCount
  };
};
