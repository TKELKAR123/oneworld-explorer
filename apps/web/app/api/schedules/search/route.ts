import { searchSchedules } from "@oneworld-explorer/schedules";
import { NextResponse } from "next/server";

/** Live schedule providers — dormant unless SCHEDULE_LIVE=1 (not exposed in UI). */
export async function POST(request: Request) {
  let body: {
    from?: string;
    to?: string;
    date?: string;
    carriers?: string[];
    includeIneligible?: boolean;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (process.env.SCHEDULE_LIVE !== "1") {
    return NextResponse.json({
      asOf: new Date().toISOString(),
      scheduleOnly: true,
      flights: [],
      warnings: [
        "Live schedule search is disabled. Use Google Flights links and paste times into Schedule & carriers.",
      ],
      provider: "disabled",
    });
  }

  const from = body.from?.trim().toUpperCase();
  const to = body.to?.trim().toUpperCase();
  const date = body.date?.trim();

  if (!from || !to || !date) {
    return NextResponse.json({
      asOf: new Date().toISOString(),
      scheduleOnly: true,
      flights: [],
      warnings: ["Missing required fields: from, to, date"],
      provider: "stub",
    });
  }

  try {
    const result = await searchSchedules(
      { from, to, date, carriers: body.carriers?.map((c) => c.toUpperCase()) },
      { includeIneligible: body.includeIneligible },
    );
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({
      asOf: new Date().toISOString(),
      scheduleOnly: true,
      from,
      to,
      date,
      flights: [],
      warnings: ["Schedule lookup failed unexpectedly"],
      provider: "stub",
    });
  }
}
