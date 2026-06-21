import { validateRouteRequest } from "@oneworld-explorer/core";
import type {
  RouteSegment,
  StopListInput,
  TravelClass,
  ValidateRequestInput,
} from "@oneworld-explorer/core";
import { NextResponse } from "next/server";

interface ValidateBody extends ValidateRequestInput {
  travelClass?: TravelClass;
  stops?: string[];
  legTypes?: StopListInput["legTypes"];
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

  if (!body.stops?.length && !body.segments?.length) {
    return NextResponse.json(
      { valid: false, error: "Provide stops[] or segments[]" },
      { status: 400 },
    );
  }

  const result = validateRouteRequest({
    stops: body.stops,
    legTypes: body.legTypes,
    segments: body.segments,
    travelClass: body.travelClass,
    ticket: body.ticket,
    validationMode: body.validationMode,
    legScheduleStates: body.legScheduleStates,
    stopIntents: body.stopIntents,
    rulesVersion: body.rulesVersion,
    clientPhase: body.clientPhase,
    validationPhase: body.validationPhase,
  });

  return NextResponse.json(result);
}
