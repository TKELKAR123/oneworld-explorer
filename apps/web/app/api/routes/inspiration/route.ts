import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { NextResponse } from "next/server";

const repoRoot = join(process.cwd(), "../..");
const inspirationPath = join(repoRoot, "data/inspiration-routes.json");

export async function GET() {
  if (!existsSync(inspirationPath)) {
    return NextResponse.json({ routes: [], source: "catalog" });
  }
  const routes = JSON.parse(readFileSync(inspirationPath, "utf-8"));
  return NextResponse.json({
    routes,
    source: "catalog",
    disclaimer: "Template routes from golden scenarios — not live inventory.",
  });
}
