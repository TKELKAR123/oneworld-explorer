import { queryRouteNetwork } from "@oneworld-explorer/schedules";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const from = url.searchParams.get("from")?.trim().toUpperCase();
  const to = url.searchParams.get("to")?.trim().toUpperCase();
  const preview = url.searchParams.get("preview") === "future-members";

  if (!from || !to || from.length !== 3 || to.length !== 3) {
    return NextResponse.json(
      { error: "Query params from and to (3-letter IATA) are required" },
      { status: 400 },
    );
  }

  const result = queryRouteNetwork(from, to, undefined, {
    includeFutureMembers: preview,
  });
  return NextResponse.json(result);
}
