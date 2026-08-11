import { expect, test } from "@playwright/test";
import { execFile } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:net";
import { access, mkdir, mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const execute = promisify(execFile);
const port = 3117;
let evidenceRoot = "";
const requiredMatrixFiles = [
  "chromium-desktop-acroxtv.png",
  "chromium-desktop-alta-data-te-tire.png",
  "chromium-tablet-acroxtv.png",
  "chromium-tablet-alta-data-te-tire.png",
  "chromium-mobile-acroxtv.png",
  "chromium-mobile-alta-data-te-tire.png",
  "firefox-desktop-acroxtv.png",
  "firefox-desktop-alta-data-te-tire.png",
  "firefox-tablet-acroxtv.png",
  "firefox-tablet-alta-data-te-tire.png",
  "firefox-mobile-acroxtv.png",
  "firefox-mobile-alta-data-te-tire.png",
  "webkit-desktop-acroxtv.png",
  "webkit-desktop-alta-data-te-tire.png",
  "webkit-tablet-acroxtv.png",
  "webkit-tablet-alta-data-te-tire.png",
  "webkit-mobile-acroxtv.png",
  "webkit-mobile-alta-data-te-tire.png",
  "iphone-12-mobile-acroxtv.png",
  "iphone-12-mobile-alta-data-te-tire.png"
].sort();

test.describe.configure({ mode: "serial", timeout: 180_000 });
test.setTimeout(180_000);

test.beforeAll(async ({}, testInfo) => {
  testInfo.setTimeout(180_000);
  evidenceRoot = await mkdtemp(join(tmpdir(), "acroxtv-wp1-capture-"));
  await mkdir(join(evidenceRoot, "contract"));
  await writeFile(join(evidenceRoot, "contract", "stale-artifact.txt"), "must be removed");

  await execute("node", ["scripts/capture-wp1-visual-baseline.mjs"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      WP1_EVIDENCE_ROOT: evidenceRoot,
      WP1_PORT: String(port),
      WP1_RUN: "contract"
    },
    timeout: 180_000
  });
});

test.afterAll(async () => {
  if (evidenceRoot) await rm(evidenceRoot, { force: true, recursive: true });
});

test("WP-1 capture removes stale artifacts before writing its complete matrix", async () => {
  await expect(access(join(evidenceRoot, "contract", "stale-artifact.txt"))).rejects.toThrow();

  const files = await readdir(join(evidenceRoot, "contract"));
  expect(files.filter((file) => file.endsWith(".png")).sort()).toEqual(requiredMatrixFiles);
  expect(files).toContain("checksums.sha256");
});

test("WP-1 capture releases the managed server port after its matrix completes", async () => {
  const listener = createServer();
  listener.listen(port, "127.0.0.1");
  await once(listener, "listening");
  expect(listener.address()).not.toBeNull();
  await new Promise<void>((resolve, reject) => listener.close((error) => error ? reject(error) : resolve()));
});
