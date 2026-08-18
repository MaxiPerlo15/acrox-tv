import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const directory = fileURLToPath(new URL(".", import.meta.url));
const excluded = new Set(["manifest.sha256", "report.md"]);
const productCommit = "55f4e33ec21ab04a1d1460b3ed7d28b51995bf50";
const evidencePayloadCommit = "73ff1802781464a408b578937dfde2034daea19b";
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
    "# Excluded as self-referential: manifest.sha256, report.md",
    ...hashes,
    ""
  ].join("\n")
);
