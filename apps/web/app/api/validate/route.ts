import { validateRoute } from "@oneworld-explorer/core";
import type { RouteSegment, TravelClass } from "@oneworld-explorer/core";
import { NextResponse } from "next/server";

interface ValidateBody {
  travelClass?: TravelClass;
  segments?: RouteSegment[];
}

export async function POST(request: Request) {
  let body: ValidateBody;
  try {
    body = (await request.json()) as ValidateBody;
  } catch {
    return NextResponse.json(
      { valid: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  if (!body.segments?.length) {
    return NextResponse.json(
      { valid: false, error: "segments array is required" },
      { status: 400 },
    );
  }

  const result = validateRoute(body.segments, {
    travelClass: body.travelClass ?? "economy",
  });

  return NextResponse.json(result);
}
