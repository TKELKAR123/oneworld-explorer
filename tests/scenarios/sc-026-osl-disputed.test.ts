import { describe, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { runScenario, type ScenarioCatalogEntry } from "./run-scenario.js";

const fixturePath = join(
  dirname(fileURLToPath(import.meta.url)),
  "fixtures/sc-026-osl-full-disputed.json",
);

describe("SC-026 OSL disputed FlyerTalk route", () => {
  it("invalid on Africa/EU intercon and Asia segment budget only when ticketReady", () => {
    const fixture = JSON.parse(readFileSync(fixturePath, "utf-8")) as ScenarioCatalogEntry;
    runScenario(fixture);
  });
});
