import { NextResponse } from "next/server";
import { createProgramFeedService } from "@/application/acroxtv-feed.service";

export const dynamic = "force-dynamic";

type ProgramFeedService = Pick<ReturnType<typeof createProgramFeedService>, "get">;

export const createProgramFeedRoute = (programFeedService: ProgramFeedService = createProgramFeedService()) =>
  async (_: Request, { params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = await params;
    const feed = await programFeedService.get(slug);

    if (!feed) {
      return new NextResponse(null, {
        status: 404,
        headers: { "Cache-Control": "private, no-store, max-age=0" }
      });
    }

    return NextResponse.json(feed, {
      headers: { "Cache-Control": "private, no-store, max-age=0" }
    });
  };

export const GET = createProgramFeedRoute();
