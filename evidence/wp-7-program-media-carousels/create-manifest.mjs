import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const directory = fileURLToPath(new URL(".", import.meta.url));
const excluded = new Set(["create-manifest.mjs", "manifest.sha256", "report.md"]);
const productCommit = "1f675822ee0b259f960acdf4d1d4011e5708a80a";
const evidencePayloadCommit = "e25d0ff705c5526b81de512e7a17566e8cdcec45";
const files = (await readdir(directory)).filter((file) => !excluded.has(file)).sort();
const hashes = await Promise.all(files.map(async (file) => {
  const contents = await readFile(`${directory}/${file}`);
  return `${createHash("sha256").update(contents).digest("hex")}  ${file}`;
}));

await writeFile(`${directory}/manifest.sha256`, [
  "# WP-7 program media carousels immutable evidence manifest",
  `# Product commit: ${productCommit}`,
  `# Evidence payload commit: ${evidencePayloadCommit}`,
  "# Excluded metadata: create-manifest.mjs, manifest.sha256, report.md",
  ...hashes,
  ""
].join("\n"));
