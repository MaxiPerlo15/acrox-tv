import type { MetadataRoute } from "next";
import { PROGRAMS, programPath } from "@/domain/programs";
import { SITE_URL } from "@/domain/site-config";

const baseUrl = SITE_URL;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(process.env.NEXT_BUILD_DATE ?? "2026-01-01");

  return [
    {
      url: `${baseUrl}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1
    },
    ...PROGRAMS.map((program) => ({
      url: `${baseUrl}${programPath(program.slug)}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8
    })),
    {
      url: `${baseUrl}/privacy`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6
    },
    {
      url: `${baseUrl}/proyectos`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8
    },
    {
      url: `${baseUrl}/terms`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5
    }
  ];
}
