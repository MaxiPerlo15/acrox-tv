import { expect, test } from "@playwright/test";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import playwrightConfig from "../../playwright.config";
import nextConfig from "../../next.config";
import sitemap from "@/app/sitemap";
import {
  assertProgramRegistry,
  PROGRAMS,
  programPath,
  type Program
} from "@/domain/programs";

const validProgram: Program = {
  slug: "programa-prueba",
  name: "Programa de prueba",
  summary: "Resumen del programa de prueba."
};

const staticRouteSegments = readdirSync(resolve(process.cwd(), "src/app"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && !entry.name.startsWith("[") && !entry.name.startsWith("("))
  .map((entry) => entry.name);

const publicRootPaths = readdirSync(resolve(process.cwd(), "public"), { withFileTypes: true })
  .filter((entry) => entry.isFile() || entry.isDirectory())
  .map((entry) => entry.name);

test.describe("Acrox TV program registry contract", () => {
  test("exposes the two canonical program paths", () => {
    expect(PROGRAMS.map((program) => program.slug)).toEqual(["alta-data-te-tire", "mas-que-nutricion"]);
    expect(programPath("alta-data-te-tire")).toBe("/alta-data-te-tire");
    expect(programPath("mas-que-nutricion")).toBe("/mas-que-nutricion");
  });

  test("discovers every registered program through its direct canonical sitemap URL", () => {
    const urls = sitemap().map((entry) => entry.url);

    for (const program of PROGRAMS) {
      expect(urls).toContain(`https://acrox.com.ar/${program.slug}`);
    }
  });

  test("rejects duplicate and reserved slugs", () => {
    expect(() => assertProgramRegistry([validProgram, validProgram])).toThrow(/unique/i);
    expect(() => assertProgramRegistry([{ ...validProgram, slug: "api" }])).toThrow(/reserved/i);
  });

  test("rejects invalid, static-route, and public-root collisions", () => {
    expect(() => assertProgramRegistry([{ ...validProgram, slug: "Programa Prueba" }])).toThrow(/kebab-case/i);
    expect(() => assertProgramRegistry([{ ...validProgram, slug: "custom-static" }], ["custom-static"])).toThrow(
      /static route/i
    );
    expect(() => assertProgramRegistry([{ ...validProgram, slug: "programa-prueba" }], [], ["programa-prueba"])).toThrow(
      /public path/i
    );
    expect(() => assertProgramRegistry([{ ...validProgram, slug: "recursos" }], [], ["recursos"])).toThrow(/public path/i);
  });

  test("does not collide with current static routes or public-root paths", () => {
    expect(() => assertProgramRegistry(PROGRAMS, staticRouteSegments, publicRootPaths)).not.toThrow();
  });

  test("runs the parallel browser suite against a fresh production server", () => {
    expect(playwrightConfig.forbidOnly).toBe(true);
    expect(playwrightConfig).toMatchObject({
      use: { baseURL: "http://127.0.0.1:3015" },
      webServer: {
        command: "npm run build && npm run start -- -p 3015",
        url: "http://127.0.0.1:3015",
        reuseExistingServer: false
      }
    });
  });

  test("pins Turbopack to this absolute project root", () => {
    expect(nextConfig.turbopack?.root).toBe(resolve(process.cwd()));
  });

  test("documents the registry, media adapter, and scoped feed HTTP contracts", () => {
    const readme = readFileSync(resolve(process.cwd(), "README.md"), "utf8");

    expect(readme).toContain("`PROGRAMS`");
    expect(readme).toContain("`ProgramSlug`");
    expect(readme).toContain("`programPath`");
    expect(readme).toContain("`assertProgramRegistry`");
    expect(readme).toContain("reserved segments");
    expect(readme).toContain("static route segments");
    expect(readme).toContain("public-root paths");
    expect(readme).toContain("`PROGRAM_MEDIA_SOURCES`");
    expect(readme).toContain("`fetchProgramYouTubeFeed`");
    expect(readme).toContain("server-only");
    expect(readme).toContain("no deben llegar desde el navegador");
    expect(readme).toContain("`GET /api/acroxtv-feed/[slug]`");
    expect(readme).toContain("`available`");
    expect(readme).toContain("`stale`");
    expect(readme).toContain("`error`");
    expect(readme).toContain("`unavailable`");
    expect(readme).toContain("`Cache-Control: private, no-store, max-age=0`");
  });
});
