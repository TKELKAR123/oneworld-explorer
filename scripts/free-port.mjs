#!/usr/bin/env node
/** Kill any process listening on the given TCP port (best-effort). */
import { execSync } from "node:child_process";

const port = process.argv[2];
if (!port || !/^\d+$/.test(port)) {
  console.error("usage: free-port.mjs <port>");
  process.exit(1);
}

try {
  execSync(`lsof -ti :${port} | xargs kill -9`, { stdio: "ignore" });
} catch {
  // nothing listening
}
