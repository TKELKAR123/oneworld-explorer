import { NextResponse } from "next/server";
import {
  loadNetworkNodes,
  NETWORK_DISCLAIMER,
  ROUTE_NETWORK_SOURCE,
} from "@oneworld-explorer/schedules";

export async function GET() {
  const nodes = loadNetworkNodes();
  return NextResponse.json({
    nodes,
    count: nodes.length,
    source: ROUTE_NETWORK_SOURCE,
    disclaimer: NETWORK_DISCLAIMER,
  });
}
