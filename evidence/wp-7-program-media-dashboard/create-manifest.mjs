import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const directory = fileURLToPath(new URL(".", import.meta.url));
const excluded = new Set([
  "create-manifest.mjs",
  "manifest.sha256",
  "normalized-payload-diff-check.log",
  "raw-payload-diff-check.log",
  "report.md"
]);
const productCommit = "55f4e33ec21ab04a1d1460b3ed7d28b51995bf50";
const evidencePayloadCommit = "b434e1fe3e9884c199fd447296ed778cfb4a3065";
const files = (await readdir(directory)).filter((file) => !excluded.has(file)).sort();
const hashes = await Promise.all(files.map(async (file) => {
  const contents = await readFile(`${directory}/${file}`);
  return `${createHash("sha256").update(contents).digest("hex")}  ${file}`;
}));

await writeFile(
  `${directory}/manifest.sha256`,
  [
    "# WP-7 immutable evidence manifest",
    `# Product commit: ${productCommit}`,
    `# Evidence payload commit: ${evidencePayloadCommit}`,
    "# Excluded metadata: create-manifest.mjs, manifest.sha256, normalized-payload-diff-check.log, raw-payload-diff-check.log, report.md",
    ...hashes,
    ""
  ].join("\n")
);
