import { NextResponse } from "next/server";
import { getLatestSocialContent } from "@/application/social-content.service";

export const revalidate = 300;

export async function GET() {
  try {
    const result = await getLatestSocialContent();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        items: [],
        source: "fallback",
        warnings: ["Error inesperado al cargar redes."]
      },
      { status: 500 }
    );
  }
}
