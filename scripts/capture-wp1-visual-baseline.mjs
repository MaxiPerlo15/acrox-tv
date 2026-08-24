import { createHash } from "node:crypto";
import { once } from "node:events";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { request } from "node:http";
import { spawn } from "node:child_process";
import { chromium, devices, firefox, webkit } from "@playwright/test";

const run = process.env.WP1_RUN ?? "run-1";
const port = Number(process.env.WP1_PORT ?? "3017");
const baseURL = `http://127.0.0.1:${port}`;
const evidenceRoot = process.env.WP1_EVIDENCE_ROOT ?? "evidence/wp-1-visual-baseline";
const output = `${evidenceRoot}/${run}`;
const publicEnvironment = {
  NEXT_PUBLIC_WHATSAPP_NUMBER: "5491100000000",
  NEXT_PUBLIC_CONTACT_EMAIL: "contact@example.com",
  NEXT_PUBLIC_INSTAGRAM_URL: "https://instagram.com/example",
  NEXT_PUBLIC_TIKTOK_URL: "https://tiktok.com/@example",
  NEXT_PUBLIC_YOUTUBE_URL: "https://youtube.com/@example"
};
const targets = [
  ["chromium", chromium, { viewport: { width: 1440, height: 900 } }, "desktop"],
  ["chromium", chromium, { viewport: { width: 768, height: 1024 } }, "tablet"],
  ["chromium", chromium, { viewport: { width: 390, height: 844 } }, "mobile"],
  ["firefox", firefox, { viewport: { width: 1440, height: 900 } }, "desktop"],
  ["firefox", firefox, { viewport: { width: 768, height: 1024 } }, "tablet"],
  ["firefox", firefox, { viewport: { width: 390, height: 844 } }, "mobile"],
  ["webkit", webkit, { viewport: { width: 1440, height: 900 } }, "desktop"],
  ["webkit", webkit, { viewport: { width: 768, height: 1024 } }, "tablet"],
  ["webkit", webkit, { viewport: { width: 390, height: 844 } }, "mobile"],
  ["iphone-12", webkit, devices["iPhone 12"], "mobile"]
];
const feed = {
  liveItem: null,
  latestEpisode: null,
  topEpisode: null,
  episodes: [],
  instagram: [],
  youtubeError: true,
  instagramError: true
};
const stableContext = {
  colorScheme: "light",
  deviceScaleFactor: 1,
  locale: "en-US",
  reducedMotion: "reduce",
  timezoneId: "UTC"
};

function runCommand(command, args, options = {}) {
  const child = spawn(command, args, { stdio: "inherit", ...options });
  return once(child, "close").then(([code, signal]) => {
    if (code !== 0) throw new Error(`${command} ${args.join(" ")} exited with ${code ?? signal}`);
  });
}

async function assertPortAvailable() {
  const reservation = createServer();
  reservation.listen(port, "127.0.0.1");
  await once(reservation, "listening");
  await new Promise((resolve, reject) => reservation.close((error) => error ? reject(error) : resolve()));
}

function waitForServer() {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + 30_000;
    const poll = () => {
      const probe = request(baseURL, (response) => {
        response.resume();
        response.on("end", () => response.statusCode && response.statusCode < 500 ? resolve() : retry());
      });
      probe.on("error", retry);
      probe.end();
    };
    const retry = () => Date.now() > deadline ? reject(new Error(`server did not start on ${port}`)) : setTimeout(poll, 250);
    poll();
  });
}

async function stopServer(server) {
  if (server.exitCode !== null || server.signalCode !== null) return;

  const exited = once(server, "close");
  if (process.platform === "win32") server.kill("SIGTERM");
  else process.kill(-server.pid, "SIGTERM");

  await Promise.race([
    exited,
    new Promise((resolve) => setTimeout(resolve, 5_000))
  ]);

  if (server.exitCode === null && server.signalCode === null) {
    if (process.platform === "win32") server.kill("SIGKILL");
    else process.kill(-server.pid, "SIGKILL");
  }
}

async function stabilizePage(page) {
  await page.route("**/api/acroxtv-feed**", (route) => route.fulfill({
    body: JSON.stringify(feed),
    contentType: "application/json"
  }));
  await page.route("https://**", (route) => route.fulfill({ status: 204, body: "" }));
  await page.addInitScript(() => {
    const style = document.createElement("style");
    style.textContent = [
      "html{scroll-behavior:auto!important}",
      "*,*::before,*::after{animation:none!important;caret-color:transparent!important;transition:none!important}",
      "[data-reveal]{opacity:1!important;transform:none!important}"
    ].join("");
    document.documentElement.append(style);
    window.matchMedia = (query) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false
    });
    HTMLMediaElement.prototype.play = () => Promise.resolve();
    HTMLMediaElement.prototype.pause = () => {};
  });
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
}

async function waitForStablePaint(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    window.scrollTo(0, 0);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
}

async function captureMatrix() {
  await rm(output, { force: true, recursive: true });
  await mkdir(output, { recursive: true });
  await assertPortAvailable();
  await runCommand("npm", ["run", "build"], {
    env: { ...process.env, ...publicEnvironment, NODE_ENV: "production" }
  });

  const server = spawn("npm", ["run", "start", "--", "-p", String(port)], {
    detached: process.platform !== "win32",
    env: { ...process.env, ...publicEnvironment, NODE_ENV: "production" },
    stdio: "inherit"
  });

  try {
    await waitForServer();
    const checksums = [];
    for (const [name, browserType, targetOptions, viewport] of targets) {
      const browser = await browserType.launch();
      const context = await browser.newContext({ ...targetOptions, ...stableContext });
      const page = await context.newPage();
      await stabilizePage(page);

      for (const [route, file] of [["/#acroxtv", `${name}-${viewport}-acroxtv.png`], ["/alta-data-te-tire", `${name}-${viewport}-alta-data-te-tire.png`]]) {
        await page.goto(`${baseURL}${route}`, { waitUntil: "networkidle" });
        await waitForStablePaint(page);
        const subject = page.locator(route.includes("#") ? "#acroxtv" : "main");
        await subject.scrollIntoViewIfNeeded();
        await subject.screenshot({ animations: "disabled", path: `${output}/${file}` });
        checksums.push(`${createHash("sha256").update(await readFile(`${output}/${file}`)).digest("hex")}  ${run}/${file}`);
      }

      await browser.close();
    }
    await writeFile(`${output}/checksums.sha256`, `${checksums.join("\n")}\n`);
  } finally {
    await stopServer(server);
  }
}

captureMatrix().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
