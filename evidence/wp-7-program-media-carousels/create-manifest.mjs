import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const directory = fileURLToPath(new URL(".", import.meta.url));
const excluded = new Set(["create-manifest.mjs", "manifest.sha256", "report.md"]);
const productCommit = "ea0a637ab4c80af8af1510c085c9c9efab1a82aa";
const evidencePayloadCommit = "96b68d981d7d437f1f72497b45a25d9d48bf789e";
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
