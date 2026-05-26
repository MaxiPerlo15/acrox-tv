import { NextResponse } from "next/server";
import { getCachedInstagramAsset } from "@/infrastructure/instagram-asset";

export const revalidate = 300;

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const assetId = requestUrl.searchParams.get("id");

  if (!assetId) {
    return new NextResponse(null, { status: 400 });
  }

  const cachedAsset = getCachedInstagramAsset(assetId);
  if (!cachedAsset) {
    return new NextResponse(null, { status: 404 });
  }

  const headers = new Headers();
  const { contentType, contentLength, etag, lastModified, body } = cachedAsset;

  if (contentType) headers.set("Content-Type", contentType);
  if (contentLength) headers.set("Content-Length", contentLength);
  if (etag) headers.set("ETag", etag);
  if (lastModified) headers.set("Last-Modified", lastModified);
  headers.set("Cache-Control", "public, max-age=300, s-maxage=300, stale-while-revalidate=900");

  return new NextResponse(Buffer.from(body), {
    status: 200,
    headers
  });
}
