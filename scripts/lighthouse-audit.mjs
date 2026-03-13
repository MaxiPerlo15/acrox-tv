#!/usr/bin/env node

import { execFile, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const FOCUS_PAGES = ["/", "/proyectos"];
const SMOKE_PAGES = ["/privacy", "/terms"];
const OPTIONAL_SMOKE_PROFILES = ["fast-4g"];
const REQUIRED_SMOKE_PROFILES = ["no-throttle"];

const PROFILES = {
  "no-throttle": {
    throttlingMethod: "provided",
    cpuSlowdownMultiplier: 1
  },
  "fast-4g": {
    throttlingMethod: "devtools",
    downloadKbps: 9000,
    uploadKbps: 1500,
    latencyMs: 40,
    cpuSlowdownMultiplier: 2
  },
  "slow-4g": {
    throttlingMethod: "devtools",
    downloadKbps: 1600,
    uploadKbps: 750,
    latencyMs: 150,
    cpuSlowdownMultiplier: 4
  },
  "3g": {
    throttlingMethod: "devtools",
    downloadKbps: 780,
    uploadKbps: 330,
    latencyMs: 300,
    cpuSlowdownMultiplier: 4
  }
};

const args = parseArgs(process.argv.slice(2));
const target = args.target ?? "local";
const smokeFast4g = args["smoke-fast4g"] !== "false";
const runId = new Date().toISOString().replace(/[:.]/g, "-");

const rootDir = process.cwd();
const artifactsRoot = path.join(rootDir, "artifacts", "lighthouse");
const runsRoot = path.join(artifactsRoot, "runs");

const baseUrlFromArg = args["base-url"];
const baseUrlFromEnv = process.env.BASE_URL;
const previewBaseUrl = baseUrlFromArg || baseUrlFromEnv || "";
const localPort = Number.parseInt(args.port ?? process.env.PORT ?? "4314", 10);
const localBaseUrl = `http://127.0.0.1:${localPort}`;

const chromePath = resolveChromePath();

if (!["local", "preview", "report"].includes(target)) {
  fail(`Target inválido: ${target}. Usá --target=local|preview|report.`);
}

if (target === "preview" && !previewBaseUrl) {
  fail("Falta BASE_URL para preview. Ejemplo: BASE_URL=https://tu-preview.vercel.app npm run perf:audit:preview");
}

if (!chromePath) {
  fail("No se encontró Chrome. Definí CHROME_PATH o instalá Google Chrome.");
}

await mkdir(runsRoot, { recursive: true });

if (target === "report") {
  await buildCombinedReport({ artifactsRoot });
  process.exit(0);
}

const runDir = path.join(runsRoot, `${runId}-${target}`);
const rawDir = path.join(runDir, "raw");
await mkdir(rawDir, { recursive: true });

let serverProcess = null;
let activeBaseUrl = target === "local" ? localBaseUrl : normalizeBaseUrl(previewBaseUrl);

try {
  if (target === "local") {
    await runNpmScript("build");
    serverProcess = await startLocalServer(localPort);
    await waitForHttpOk(activeBaseUrl, 90_000);
  }

  const profileMatrix = buildMatrix({ smokeFast4g });
  const runs = [];

  for (const entry of profileMatrix) {
    const url = `${activeBaseUrl}${entry.page}`;
    const result = await runLighthouse({
      url,
      profileKey: entry.profile,
      chromePath
    });
    const rawFile = path.join(rawDir, `${slug(entry.page)}__${entry.profile}.json`);
    await writeJson(rawFile, result);

    const extracted = extractMetrics(result);
    runs.push({
      target,
      page: entry.page,
      profile: entry.profile,
      url,
      ...extracted
    });
  }

  const summary = createSummary({
    target,
    runId,
    baseUrl: activeBaseUrl,
    runs,
    smokeFast4g
  });

  await writeJson(path.join(runDir, "summary.json"), summary);
  await writeFile(path.join(runDir, "summary.md"), renderSummaryMarkdown(summary), "utf8");
  await writeFile(path.join(artifactsRoot, `latest-${target}.txt`), runDir, "utf8");

  console.log(`Lighthouse ${target} finalizado: ${runDir}`);
  console.log(`Resumen: ${path.join(runDir, "summary.md")}`);
} finally {
  if (serverProcess) {
    serverProcess.kill("SIGINT");
  }
}

function parseArgs(argv) {
  const parsed = {};
  for (const arg of argv) {
    if (!arg.startsWith("--")) continue;
    const [k, v] = arg.replace(/^--/, "").split("=");
    parsed[k] = v ?? "true";
  }
  return parsed;
}

function normalizeBaseUrl(value) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function buildMatrix({ smokeFast4g }) {
  const matrix = [];
  for (const page of FOCUS_PAGES) {
    for (const profile of Object.keys(PROFILES)) {
      matrix.push({ page, profile });
    }
  }

  for (const page of SMOKE_PAGES) {
    for (const profile of REQUIRED_SMOKE_PROFILES) {
      matrix.push({ page, profile });
    }
    if (smokeFast4g) {
      for (const profile of OPTIONAL_SMOKE_PROFILES) {
        matrix.push({ page, profile });
      }
    }
  }

  return matrix;
}

function resolveChromePath() {
  const fromEnv = process.env.CHROME_PATH;
  if (fromEnv) return fromEnv;

  const candidates = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable"
  ];
  return candidates.find((candidate) => exists(candidate)) || null;
}

function exists(filePath) {
  return existsSync(filePath);
}

async function runNpmScript(scriptName) {
  await new Promise((resolve, reject) => {
    const child = spawn("npm", ["run", scriptName], {
      cwd: rootDir,
      stdio: "inherit"
    });
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`npm run ${scriptName} falló con exit code ${code}`));
    });
  });
}

async function startLocalServer(port) {
  const child = spawn("npm", ["run", "start"], {
    cwd: rootDir,
    stdio: "inherit",
    env: { ...process.env, PORT: String(port) }
  });

  child.on("exit", (code) => {
    if (code !== 0) {
      console.error(`next start terminó con exit code ${code}`);
    }
  });

  return child;
}

async function waitForHttpOk(baseUrl, timeoutMs) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(baseUrl, { method: "GET" });
      if (response.ok) return;
    } catch {
      // retry
    }
    await sleep(800);
  }
  throw new Error(`Timeout esperando server local: ${baseUrl}`);
}

async function runLighthouse({ url, profileKey, chromePath }) {
  const profile = PROFILES[profileKey];
  if (!profile) throw new Error(`Perfil desconocido: ${profileKey}`);

  const baseArgs = [
    "lighthouse",
    url,
    "--quiet",
    "--preset=perf",
    "--only-categories=performance",
    "--output=json",
    "--output-path=stdout",
    "--form-factor=mobile",
    "--screenEmulation.mobile=true",
    "--screenEmulation.width=390",
    "--screenEmulation.height=844",
    "--screenEmulation.deviceScaleFactor=3",
    `--chrome-path=${chromePath}`
  ];

  if (profile.throttlingMethod === "provided") {
    baseArgs.push("--throttling-method=provided");
    baseArgs.push("--throttling.cpuSlowdownMultiplier=1");
  } else {
    baseArgs.push("--throttling-method=devtools");
    baseArgs.push(`--throttling.rttMs=${profile.latencyMs}`);
    baseArgs.push(`--throttling.throughputKbps=${profile.downloadKbps}`);
    baseArgs.push(`--throttling.uploadThroughputKbps=${profile.uploadKbps}`);
    baseArgs.push(`--throttling.cpuSlowdownMultiplier=${profile.cpuSlowdownMultiplier}`);
  }

  const { stdout } = await execFileAsync("npx", baseArgs, {
    cwd: rootDir,
    maxBuffer: 30 * 1024 * 1024
  });

  const jsonStart = stdout.indexOf("{");
  if (jsonStart < 0) {
    throw new Error(`Lighthouse no devolvió JSON para ${url} (${profileKey})`);
  }
  return JSON.parse(stdout.slice(jsonStart));
}

function extractMetrics(result) {
  const audits = result.audits ?? {};
  const perfScore = Math.round(((result.categories?.performance?.score ?? 0) * 1000)) / 10;

  const thirdParty = extractThirdPartyInsight(audits);
  const renderBlockingMs = readAuditMs(audits["render-blocking-insight"])
    ?? readAuditMs(audits["render-blocking-resources"]);

  const unusedJsBytes = readAuditBytes(audits["unused-javascript"]);
  const unusedCssBytes = readAuditBytes(audits["unused-css-rules"]);
  const totalBytes = readAuditBytes(audits["total-byte-weight"]);

  return {
    score: perfScore,
    fcpMs: readAuditMs(audits["first-contentful-paint"]),
    lcpMs: readAuditMs(audits["largest-contentful-paint"]),
    cls: readAuditValue(audits["cumulative-layout-shift"]),
    tbtMs: readAuditMs(audits["total-blocking-time"]),
    inpMs: readAuditMs(audits["interaction-to-next-paint"]) ?? null,
    speedIndexMs: readAuditMs(audits["speed-index"]),
    ttfbMs:
      readAuditMs(audits["server-response-time"])
      ?? readAuditMs(audits["network-server-latency"])
      ?? null,
    totalBytes,
    renderBlockingMs,
    unusedJsBytes,
    unusedCssBytes,
    thirdPartyTransferBytes: thirdParty.transferBytes,
    thirdPartyMainThreadMs: thirdParty.mainThreadMs
  };
}

function readAuditMs(audit) {
  if (!audit) return null;
  if (typeof audit.numericValue === "number") return Math.round(audit.numericValue);
  if (typeof audit.details?.overallSavingsMs === "number") return Math.round(audit.details.overallSavingsMs);
  return null;
}

function readAuditBytes(audit) {
  if (!audit) return null;
  if (typeof audit.numericValue === "number") return Math.round(audit.numericValue);
  if (typeof audit.details?.overallSavingsBytes === "number") return Math.round(audit.details.overallSavingsBytes);
  return null;
}

function readAuditValue(audit) {
  if (!audit) return null;
  if (typeof audit.numericValue === "number") return audit.numericValue;
  return null;
}

function extractThirdPartyInsight(audits) {
  const insight = audits["third-parties-insight"] ?? audits["third-party-summary"];
  const items = insight?.details?.items ?? [];
  let transferBytes = 0;
  let mainThreadMs = 0;

  for (const item of items) {
    const transfer = item.transferSize ?? item.transferBytes;
    const thread = item.mainThreadTime ?? item.mainThreadMs;
    if (typeof transfer === "number") transferBytes += transfer;
    if (typeof thread === "number") mainThreadMs += thread;
  }

  return { transferBytes: Math.round(transferBytes), mainThreadMs: Math.round(mainThreadMs) };
}

function createSummary({ target, runId, baseUrl, runs, smokeFast4g }) {
  const focusRuns = runs.filter((run) => FOCUS_PAGES.includes(run.page));
  const fast4gRuns = focusRuns.filter((run) => run.profile === "fast-4g");
  const homeFast4g = fast4gRuns.find((run) => run.page === "/");
  const projectsFast4g = fast4gRuns.find((run) => run.page === "/proyectos");

  const findings = buildFindings(runs);
  const quickWins = buildQuickWins(runs);
  const risksMobile = buildMobileRisks(runs);
  const dontTouch = buildDontTouch(runs);

  return {
    metadata: {
      target,
      runId,
      baseUrl,
      generatedAt: new Date().toISOString(),
      strategy: {
        oneRunPerPageProfile: true,
        mobileFirst: true,
        smokeFast4g
      }
    },
    thresholds: {
      fast4gGoals: {
        "/": 85,
        "/proyectos": 80
      },
      threeG: "stress-test-no-gate"
    },
    metrics: runs,
    comparisons: {
      fast4gHomeVsProjects: homeFast4g && projectsFast4g
        ? {
            homeScore: homeFast4g.score,
            projectsScore: projectsFast4g.score,
            scoreDelta: round(homeFast4g.score - projectsFast4g.score, 1),
            homeLcpMs: homeFast4g.lcpMs,
            projectsLcpMs: projectsFast4g.lcpMs,
            lcpDeltaMs: projectsFast4g.lcpMs - homeFast4g.lcpMs,
            homeTbtMs: homeFast4g.tbtMs,
            projectsTbtMs: projectsFast4g.tbtMs,
            tbtDeltaMs: projectsFast4g.tbtMs - homeFast4g.tbtMs
          }
        : null
    },
    findingsTop10: findings.slice(0, 10),
    quickWins,
    risksMobile,
    dontTouch
  };
}

function buildFindings(runs) {
  const findings = [];

  for (const run of runs) {
    const context = `${run.page} @ ${run.profile}`;
    const focusPage = FOCUS_PAGES.includes(run.page);
    const stressOnly = run.profile === "3g";

    if (run.lcpMs && run.lcpMs > 4000) {
      findings.push(makeFinding({
        id: `${context}-lcp`,
        priority: focusPage && !stressOnly ? "P0" : "P1",
        area: "LCP",
        title: `LCP alto en ${context}`,
        evidence: `LCP ${fmtMs(run.lcpMs)}`,
        recommendation: "Optimizar recursos above-the-fold, priorizar imagen/asset LCP y reducir bloqueo de render.",
        structural: focusPage
      }));
    } else if (run.lcpMs && run.lcpMs > 2500) {
      findings.push(makeFinding({
        id: `${context}-lcp-warn`,
        priority: "P1",
        area: "LCP",
        title: `LCP mejorable en ${context}`,
        evidence: `LCP ${fmtMs(run.lcpMs)}`,
        recommendation: "Ajustar carga crítica de hero y revisar fuentes/bloqueos de CSS.",
        structural: focusPage
      }));
    }

    if (run.tbtMs && run.tbtMs > 400) {
      findings.push(makeFinding({
        id: `${context}-tbt`,
        priority: focusPage && !stressOnly ? "P0" : "P1",
        area: "Interactividad",
        title: `TBT elevado en ${context}`,
        evidence: `TBT ${fmtMs(run.tbtMs)}`,
        recommendation: "Reducir JS de cliente en la carga inicial y diferir trabajo no crítico.",
        structural: true
      }));
    } else if (run.tbtMs && run.tbtMs > 200) {
      findings.push(makeFinding({
        id: `${context}-tbt-warn`,
        priority: "P1",
        area: "Interactividad",
        title: `TBT medio en ${context}`,
        evidence: `TBT ${fmtMs(run.tbtMs)}`,
        recommendation: "Identificar tareas largas y particionar trabajo de scripting.",
        structural: true
      }));
    }

    if (run.cls && run.cls > 0.15) {
      findings.push(makeFinding({
        id: `${context}-cls`,
        priority: focusPage && !stressOnly ? "P0" : "P1",
        area: "Estabilidad",
        title: `CLS inestable en ${context}`,
        evidence: `CLS ${run.cls.toFixed(3)}`,
        recommendation: "Fijar dimensiones, revisar swaps de fuentes y elementos inyectados.",
        structural: false
      }));
    }

    if (run.totalBytes && run.totalBytes > 1_500_000) {
      findings.push(makeFinding({
        id: `${context}-bytes`,
        priority: focusPage && !stressOnly ? "P1" : "P2",
        area: "Payload",
        title: `Peso de red alto en ${context}`,
        evidence: `${fmtKb(run.totalBytes)} transferidos`,
        recommendation: "Reducir bytes de imágenes y payload JS no esencial.",
        structural: focusPage
      }));
    }

    if (run.thirdPartyTransferBytes && run.thirdPartyTransferBytes > 300_000) {
      findings.push(makeFinding({
        id: `${context}-third-party`,
        priority: "P1",
        area: "Third-party",
        title: `Costo third-party alto en ${context}`,
        evidence: `${fmtKb(run.thirdPartyTransferBytes)} de terceros`,
        recommendation: "Diferir embeds y cargar terceros solo tras interacción real.",
        structural: true
      }));
    }

    if (run.renderBlockingMs && run.renderBlockingMs > 250) {
      findings.push(makeFinding({
        id: `${context}-render-blocking`,
        priority: "P1",
        area: "Render blocking",
        title: `Bloqueo de render en ${context}`,
        evidence: `Ahorro potencial ${fmtMs(run.renderBlockingMs)}`,
        recommendation: "Reducir bloqueo de recursos críticos y evaluar preconnect/preload puntuales.",
        structural: true
      }));
    }
  }

  return findings
    .sort((a, b) => findingWeight(b) - findingWeight(a))
    .slice(0, 10);
}

function buildQuickWins(runs) {
  const wins = [];
  const maxUnusedJs = Math.max(...runs.map((run) => run.unusedJsBytes ?? 0));
  const maxUnusedCss = Math.max(...runs.map((run) => run.unusedCssBytes ?? 0));
  const maxRenderBlocking = Math.max(...runs.map((run) => run.renderBlockingMs ?? 0));

  if (maxUnusedJs > 25_000) {
    wins.push("Reducir JS no usado en carga inicial (defer/islas client donde no aportan al primer render).");
  }
  if (maxUnusedCss > 15_000) {
    wins.push("Recortar CSS no usado en vistas críticas o dividir estilos de secciones tardías.");
  }
  if (maxRenderBlocking > 250) {
    wins.push("Aplicar preconnect/preload únicamente a orígenes y recursos que afecten LCP.");
  }

  wins.push("Priorizar optimizaciones en `/` y `/proyectos`; mantener `/privacy` y `/terms` en modo smoke.");
  wins.push("No perseguir score en 3G: usarlo para detectar regresiones severas, no como gate de release.");

  return wins.slice(0, 5);
}

function buildMobileRisks(runs) {
  const mobileFocus = runs.filter((run) => FOCUS_PAGES.includes(run.page) && run.profile !== "no-throttle");
  const risks = [];

  const worstLcp = mobileFocus
    .filter((run) => run.lcpMs != null)
    .sort((a, b) => (b.lcpMs ?? 0) - (a.lcpMs ?? 0))[0];
  const worstTbt = mobileFocus
    .filter((run) => run.tbtMs != null)
    .sort((a, b) => (b.tbtMs ?? 0) - (a.tbtMs ?? 0))[0];

  if (worstLcp?.lcpMs && worstLcp.lcpMs > 4000) {
    risks.push(`Riesgo de percepción lenta en ${worstLcp.page} (${worstLcp.profile}) por LCP ${fmtMs(worstLcp.lcpMs)}.`);
  }
  if (worstTbt?.tbtMs && worstTbt.tbtMs > 400) {
    risks.push(`Riesgo de baja interactividad en ${worstTbt.page} (${worstTbt.profile}) por TBT ${fmtMs(worstTbt.tbtMs)}.`);
  }

  if (risks.length === 0) {
    risks.push("No se detectaron riesgos críticos mobile en esta corrida única; validar estabilidad en iteración de multi-run.");
  }

  return risks;
}

function buildDontTouch(runs) {
  const dontTouch = [];
  const legalRuns = runs.filter((run) => SMOKE_PAGES.includes(run.page));
  const legalScoreOk = legalRuns.every((run) => run.score >= 80);
  const clsOk = runs.every((run) => (run.cls ?? 0) < 0.1);

  if (legalScoreOk) {
    dontTouch.push("No invertir esfuerzo en tuning fino de `/privacy` y `/terms` más allá de smoke/perf básica.");
  }
  if (clsOk) {
    dontTouch.push("No tocar layout visual por CLS mientras se mantenga estable (< 0.1).");
  }
  dontTouch.push("Evitar cambios visuales grandes para subir score si no mejoran UX percibida.");

  return dontTouch;
}

function renderSummaryMarkdown(summary) {
  const rows = summary.metrics
    .map((run) => `| ${run.page} | ${run.profile} | ${run.score} | ${fmtMsOrDash(run.lcpMs)} | ${fmtMsOrDash(run.tbtMs)} | ${fmtCls(run.cls)} | ${fmtMsOrDash(run.fcpMs)} | ${fmtMsOrDash(run.speedIndexMs)} | ${fmtMsOrDash(run.ttfbMs)} | ${fmtKbOrDash(run.totalBytes)} |`)
    .join("\n");

  const findings = summary.findingsTop10
    .map((item, index) => `${index + 1}. [${item.priority}] ${item.title} - ${item.evidence}. ${item.recommendation}`)
    .join("\n");

  const quickWins = summary.quickWins.map((item, index) => `${index + 1}. ${item}`).join("\n");
  const risks = summary.risksMobile.map((item, index) => `${index + 1}. ${item}`).join("\n");
  const dontTouch = summary.dontTouch.map((item, index) => `${index + 1}. ${item}`).join("\n");

  const compare = summary.comparisons.fast4gHomeVsProjects
    ? `- Home score: ${summary.comparisons.fast4gHomeVsProjects.homeScore}\n- Proyectos score: ${summary.comparisons.fast4gHomeVsProjects.projectsScore}\n- Delta score (home - proyectos): ${summary.comparisons.fast4gHomeVsProjects.scoreDelta}\n- Delta LCP (proyectos - home): ${fmtMs(summary.comparisons.fast4gHomeVsProjects.lcpDeltaMs)}\n- Delta TBT (proyectos - home): ${fmtMs(summary.comparisons.fast4gHomeVsProjects.tbtDeltaMs)}`
    : "- Sin datos fast-4g suficientes para comparar `/` vs `/proyectos`.";

  const ttfbNote = summary.metadata.target === "local"
    ? "TTFB local se interpreta solo como referencia técnica. Para conclusión real de backend/CDN, priorizar preview deploy."
    : "TTFB en preview se prioriza para análisis real de respuesta inicial.";

  return `# Lighthouse audit (${summary.metadata.target})\n\n- Run ID: \`${summary.metadata.runId}\`\n- Base URL: \`${summary.metadata.baseUrl}\`\n- Generated at: \`${summary.metadata.generatedAt}\`\n- Estrategia: 1 corrida por pagina/perfil, mobile-first\n- Nota TTFB: ${ttfbNote}\n\n## Metas orientativas (fast-4g)\n\n- \`/\`: ~85+\n- \`/proyectos\`: ~80+ aceptable\n- \`3g\`: stress test (no gate estricto)\n\n## Tabla resumida\n\n| Pagina | Perfil | Perf score | LCP | TBT | CLS | FCP | Speed Index | TTFB | Total bytes |\n|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|\n${rows}\n\n## Comparativa foco (\`/\` vs \`/proyectos\`, fast-4g)\n\n${compare}\n\n## Top 10 hallazgos accionables\n\n${findings || "Sin hallazgos relevantes en esta corrida."}\n\n## Quick wins de bajo costo\n\n${quickWins}\n\n## Riesgos reales para mobile\n\n${risks}\n\n## Que no tocar en esta iteracion\n\n${dontTouch}\n`;
}

async function buildCombinedReport({ artifactsRoot }) {
  const localPath = await readLatestPath(path.join(artifactsRoot, "latest-local.txt"));
  const previewPath = await readLatestPath(path.join(artifactsRoot, "latest-preview.txt"));

  const localSummary = localPath ? JSON.parse(await readFile(path.join(localPath, "summary.json"), "utf8")) : null;
  const previewSummary = previewPath ? JSON.parse(await readFile(path.join(previewPath, "summary.json"), "utf8")) : null;

  if (!localSummary && !previewSummary) {
    fail("No hay corridas para reportar. Ejecutá `npm run perf:audit:local` y/o `npm run perf:audit:preview`.");
  }

  const reportDir = path.join(artifactsRoot, "reports");
  await mkdir(reportDir, { recursive: true });

  const combined = {
    generatedAt: new Date().toISOString(),
    localRun: localPath,
    previewRun: previewPath,
    localSummary,
    previewSummary
  };

  await writeJson(path.join(reportDir, "report-latest.json"), combined);
  await writeFile(path.join(reportDir, "report-latest.md"), renderCombinedMarkdown(combined), "utf8");

  console.log(`Reporte combinado generado: ${path.join(reportDir, "report-latest.md")}`);
}

function renderCombinedMarkdown(report) {
  const localCompare = report.localSummary?.comparisons?.fast4gHomeVsProjects;
  const previewCompare = report.previewSummary?.comparisons?.fast4gHomeVsProjects;

  return `# Reporte combinado Lighthouse\n\n- Generated at: \`${report.generatedAt}\`\n- Local run: \`${report.localRun ?? "N/A"}\`\n- Preview run: \`${report.previewRun ?? "N/A"}\`\n\n## Referencia TTFB\n\n- Local: referencia técnica interna.\n- Preview: base de análisis para TTFB real.\n\n## Fast-4g (\`/\` vs \`/proyectos\`)\n\n| Entorno | Home score | Proyectos score | Delta score | Delta LCP | Delta TBT |\n|---|---:|---:|---:|---:|---:|\n| Local | ${localCompare?.homeScore ?? "-"} | ${localCompare?.projectsScore ?? "-"} | ${localCompare?.scoreDelta ?? "-"} | ${localCompare ? fmtMs(localCompare.lcpDeltaMs) : "-"} | ${localCompare ? fmtMs(localCompare.tbtDeltaMs) : "-"} |\n| Preview | ${previewCompare?.homeScore ?? "-"} | ${previewCompare?.projectsScore ?? "-"} | ${previewCompare?.scoreDelta ?? "-"} | ${previewCompare ? fmtMs(previewCompare.lcpDeltaMs) : "-"} | ${previewCompare ? fmtMs(previewCompare.tbtDeltaMs) : "-"} |\n\n## Top hallazgos (local)\n\n${renderList(report.localSummary?.findingsTop10)}\n\n## Top hallazgos (preview)\n\n${renderList(report.previewSummary?.findingsTop10)}\n`;
}

function renderList(items) {
  if (!items || items.length === 0) return "Sin hallazgos.";
  return items.slice(0, 10).map((item, index) => `${index + 1}. [${item.priority}] ${item.title} - ${item.evidence}`).join("\n");
}

async function readLatestPath(pointerFile) {
  try {
    const value = (await readFile(pointerFile, "utf8")).trim();
    if (!value) return null;
    return value;
  } catch {
    return null;
  }
}

function makeFinding({ id, priority, area, title, evidence, recommendation, structural }) {
  return { id, priority, area, title, evidence, recommendation, classification: structural ? "estructural" : "incidental" };
}

function findingWeight(item) {
  const base = item.priority === "P0" ? 300 : item.priority === "P1" ? 200 : 100;
  const structural = item.classification === "estructural" ? 40 : 0;
  return base + structural;
}

function fmtMs(ms) {
  return `${Math.round(ms)} ms`;
}

function fmtMsOrDash(ms) {
  return typeof ms === "number" ? fmtMs(ms) : "-";
}

function fmtCls(value) {
  return typeof value === "number" ? value.toFixed(3) : "-";
}

function fmtKb(bytes) {
  return `${Math.round(bytes / 1024)} KB`;
}

function fmtKbOrDash(bytes) {
  return typeof bytes === "number" ? fmtKb(bytes) : "-";
}

function round(value, decimals) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

async function writeJson(filePath, value) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function slug(page) {
  if (page === "/") return "home";
  return page.replace(/\//g, "_").replace(/^_+/, "");
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
