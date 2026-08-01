import "server-only";

import type { ProgramSlug } from "@/domain/programs";

export type ProgramYouTubeSource = {
  playlistId: string;
};

type ProgramMediaSource = {
  youtube: ProgramYouTubeSource;
};

export const PROGRAM_MEDIA_SOURCES = {
  "alta-data": {
    youtube: { playlistId: "PL0Nzx2OTlHZ_ZOlLPB6gPjhH88yFGIF_y" }
  },
  "mas-que-nutricion": {
    youtube: { playlistId: "PL0Nzx2OTlHZ_42gBgmG_9d6UqJgoXhWSq" }
  }
} as const satisfies Record<ProgramSlug, ProgramMediaSource>;
