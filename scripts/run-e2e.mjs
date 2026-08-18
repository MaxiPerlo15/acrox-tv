import { createServer } from "node:net";
import { spawn } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const reservation = createServer();
const nextEnvPath = fileURLToPath(new URL("../next-env.d.ts", import.meta.url));
const originalNextEnv = await readFile(nextEnvPath);

reservation.listen(0, "127.0.0.1", () => {
  const address = reservation.address();
  if (!address || typeof address === "string") throw new Error("Unable to reserve an E2E port.");

  reservation.close(() => {
    const command = process.platform === "win32" ? "npx.cmd" : "npx";
    const child = spawn(command, ["playwright", "test", ...process.argv.slice(2)], {
      env: { ...process.env, E2E_PORT: String(address.port) },
      stdio: "inherit"
    });

    child.on("exit", async (code, signal) => {
      try {
        await writeFile(nextEnvPath, originalNextEnv);
      } finally {
        process.exitCode = code ?? (signal ? 1 : 0);
      }
    });
    child.on("error", (error) => {
      console.error(error);
      process.exitCode = 1;
    });
  });
});
