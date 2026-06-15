/**
 * Smoke: production Next.js build serves homepage + API over HTTP.
 * Spawns `next start` against the built app (run `npm run build` first in CI).
 */
import { spawn, type ChildProcess } from "node:child_process";
import { createConnection } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const webRoot = join(dirname(fileURLToPath(import.meta.url)), "../../apps/web");
const PORT = 3457;

function waitForPort(port: number, timeoutMs = 30_000): Promise<void> {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tryConnect = () => {
      const socket = createConnection({ port, host: "127.0.0.1" }, () => {
        socket.end();
        resolve();
      });
      socket.on("error", () => {
        if (Date.now() - start > timeoutMs) {
          reject(new Error(`Port ${port} not ready within ${timeoutMs}ms`));
          return;
        }
        setTimeout(tryConnect, 250);
      });
    };
    tryConnect();
  });
}

let server: ChildProcess | null = null;

beforeAll(async () => {
  server = spawn("npx", ["next", "start", "-p", String(PORT)], {
    cwd: webRoot,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, NODE_ENV: "production" },
  });
  await waitForPort(PORT);
}, 60_000);

afterAll(async () => {
  if (server && !server.killed) {
    server.kill("SIGTERM");
    await new Promise((r) => server?.once("exit", r));
  }
});

describe("smoke — HTTP against production Next.js server", () => {
  it("serves homepage with app title", async () => {
    const res = await fetch(`http://127.0.0.1:${PORT}/`);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain("oneworld Explorer");
    expect(html).toContain("Validate route");
  });

  it("POST /api/validate returns JSON for classic RTW", async () => {
    const res = await fetch(`http://127.0.0.1:${PORT}/api/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        travelClass: "economy",
        segments: [
          { from: "JFK", to: "LHR" },
          { from: "LHR", to: "DXB" },
          { from: "DXB", to: "SIN" },
          { from: "SIN", to: "SYD" },
          { from: "SYD", to: "LAX" },
          { from: "LAX", to: "JFK" },
        ],
      }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.valid).toBe(true);
    expect(body.rulesVersion).toBe("2026-02-27");
  });

  it("GET /api/airports/search returns autocomplete results", async () => {
    const res = await fetch(`http://127.0.0.1:${PORT}/api/airports/search?q=JFK`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.airports[0]?.iata).toBe("JFK");
  });
});
