import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, extname, join, resolve } from "node:path";
import sharp from "sharp";

const [, , sourceDirectory, outputDirectory = "public/sponsors"] = process.argv;
const sourceNames = [
  "logo-magnus.jpg",
  "logo-fg-beauty.jpg",
  "logo-noe-peluqueria.jpg",
  "logo-san-jose.jpg",
  "logo-checa.jpg"
];

if (!sourceDirectory) {
  throw new Error("Usage: node scripts/convert-sponsor-assets.mjs <source-directory> [output-directory]");
}

const sha256 = async (path) => createHash("sha256").update(await readFile(path)).digest("hex");

const sourceRoot = resolve(sourceDirectory);
const outputRoot = resolve(outputDirectory);
await mkdir(outputRoot, { recursive: true });

const assets = [];
const converter = "sharp webp quality=86 effort=6 metadata=stripped";
for (const sourceName of sourceNames) {
  const sourcePath = join(sourceRoot, sourceName);
  const outputName = `${basename(sourceName, extname(sourceName))}.webp`;
  const outputPath = join(outputRoot, outputName);

  await sharp(sourcePath).webp({ quality: 86, effort: 6, smartSubsample: false }).toFile(outputPath);
  assets.push({
    source: sourceName,
    sourceSha256: await sha256(sourcePath),
    output: outputName,
    outputSha256: await sha256(outputPath)
  });
}

await writeFile(join(outputRoot, "conversion-manifest.json"), `${JSON.stringify({ converter, assets }, null, 2)}\n`);
