import { NextResponse } from "next/server";
import { fetchYouTubeLiveOrLatestVideo } from "@/infrastructure/youtube.client";
import { env } from "@/lib/env";

export const revalidate = 60;
const FORCE_LIVE_PREVIEW = false;

const mockItem = {
  videoId: "dQw4w9WgXcQ",
  title: "Demo Stream Acrox TV (mock visual)",
  publishedAt: "2026-02-01T18:00:00.000Z",
  thumbnailUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
  isLive: true,
  watchUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
};

export async function GET() {
  if (FORCE_LIVE_PREVIEW) {
    return NextResponse.json(
      {
        item: mockItem,
        channelUrl: env.youtubeUrl,
        isMock: false,
        warning: "Modo preview: estado EN VIVO forzado para validar la UI."
      },
      { status: 200 }
    );
  }

  try {
    const item = await fetchYouTubeLiveOrLatestVideo();

    if (!item && (!env.youtubeApiKey || !env.youtubeChannelId)) {
      return NextResponse.json(
        {
          item: mockItem,
          channelUrl: env.youtubeUrl,
          isMock: true,
          warning: "Mostrando demo visual hasta configurar YouTube API."
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        item,
        channelUrl: env.youtubeUrl,
        isMock: false
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      {
        item: (!env.youtubeApiKey || !env.youtubeChannelId) ? mockItem : null,
        channelUrl: env.youtubeUrl,
        isMock: !env.youtubeApiKey || !env.youtubeChannelId,
        warning: (!env.youtubeApiKey || !env.youtubeChannelId)
          ? "Mostrando demo visual hasta configurar YouTube API."
          : "No se pudo obtener el stream en este momento."
      },
      { status: 200 }
    );
  }
}
