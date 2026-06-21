import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { NextResponse } from "next/server";

let cached: string | null = null;

function resolveAtlasPath(): string | null {
  const candidates = [
    join(process.cwd(), "data/geography-atlas.generated.json"),
    join(process.cwd(), "../../data/geography-atlas.generated.json"),
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return null;
}

export async function GET() {
  try {
    if (!cached) {
      const path = resolveAtlasPath();
      if (!path) {
        return NextResponse.json({ error: "Geography atlas not built" }, { status: 503 });
      }
      cached = readFileSync(path, "utf8");
    }
    return new NextResponse(cached, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Geography atlas not built" }, { status: 503 });
  }
}
