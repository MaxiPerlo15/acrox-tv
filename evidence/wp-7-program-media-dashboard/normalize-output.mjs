import { readdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const directory = fileURLToPath(new URL(".", import.meta.url));
const ansi = /\u001B\][^\u0007]*(?:\u0007|\u001B\\)|\u001B\[[0-?]*[ -/]*[@-~]/g;
const rawFiles = (await readdir(directory)).filter((file) => file.startsWith("raw-") && file.endsWith(".log"));

for (const file of rawFiles) {
  const normalized = (await readFile(`${directory}/${file}`, "utf8"))
    .replace(ansi, "")
    .replace(/\/private\/var\/folders\/[^\s)]+/g, "<temporary-path>")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+$/gm, "")
    .trimEnd() + "\n";
  await writeFile(`${directory}/${file.replace(/^raw-/, "normalized-")}`, normalized);
}
