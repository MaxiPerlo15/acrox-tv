import "server-only";
import { publicEnv } from "@/lib/public-env";

const isProduction = process.env.NODE_ENV === "production";

const readOptional = (value: string | undefined): string | undefined => {
  if (!value || value.trim().length === 0) return undefined;
  return value;
};

const readRequiredPublic = (
  name: string,
  value: string | undefined,
  developmentFallback: string
): string => {
  // Keep required NEXT_PUBLIC validation server-side only.
  // Client code must consume static publicEnv values (no dynamic process.env lookup).
  const normalized = readOptional(value);
  if (normalized) return normalized;

  if (isProduction) {
    throw new Error(`[env] Missing required environment variable: ${name}`);
  }

  return developmentFallback;
};

export const env = {
  youtubeApiKey: readOptional(process.env.YOUTUBE_API_KEY),
  youtubeChannelId: readOptional(process.env.YOUTUBE_CHANNEL_ID),
  youtubePlaylistId:
    readOptional(process.env.YOUTUBE_PLAYLIST_ID) ?? "PL0Nzx2OTlHZ-dwvDH4ZbDqucGSTnDgr8T",
  instagramAccessToken: readOptional(process.env.INSTAGRAM_ACCESS_TOKEN),
  instagramUserId: readOptional(process.env.INSTAGRAM_USER_ID),
  whatsappNumber: readRequiredPublic(
    "NEXT_PUBLIC_WHATSAPP_NUMBER",
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
    publicEnv.whatsappNumber
  ),
  contactEmail: readRequiredPublic(
    "NEXT_PUBLIC_CONTACT_EMAIL",
    process.env.NEXT_PUBLIC_CONTACT_EMAIL,
    publicEnv.contactEmail
  ),
  instagramUrl: readRequiredPublic(
    "NEXT_PUBLIC_INSTAGRAM_URL",
    process.env.NEXT_PUBLIC_INSTAGRAM_URL,
    publicEnv.instagramUrl
  ),
  tiktokUrl: readRequiredPublic(
    "NEXT_PUBLIC_TIKTOK_URL",
    process.env.NEXT_PUBLIC_TIKTOK_URL,
    publicEnv.tiktokUrl
  ),
  youtubeUrl: readRequiredPublic(
    "NEXT_PUBLIC_YOUTUBE_URL",
    process.env.NEXT_PUBLIC_YOUTUBE_URL,
    publicEnv.youtubeUrl
  )
};
