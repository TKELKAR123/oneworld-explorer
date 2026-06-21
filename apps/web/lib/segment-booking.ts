import type { RouteSegment, TicketContext } from "@oneworld-explorer/core";

export interface LegBookingDetails {
  marketingCarrier?: string;
  operatingCarrier?: string;
  rbd?: string;
  departureTime?: string;
  arrivalTime?: string;
  groundTransport?: boolean;
}

export function emptyLegDetails(count: number): LegBookingDetails[] {
  return Array.from({ length: count }, () => ({}));
}

export function buildSegmentsFromStops(
  stops: string[],
  legTypes: ("flight" | "surface")[],
  legDetails: LegBookingDetails[],
): RouteSegment[] {
  const segments: RouteSegment[] = [];
  for (let i = 0; i < stops.length - 1; i++) {
    const detail = legDetails[i] ?? {};
    const segment: RouteSegment = {
      from: stops[i]!,
      to: stops[i + 1]!,
      surface: legTypes[i] === "surface",
    };
    if (detail.marketingCarrier?.trim()) {
      segment.marketingCarrier = detail.marketingCarrier.trim().toUpperCase();
    }
    if (detail.operatingCarrier?.trim()) {
      segment.operatingCarrier = detail.operatingCarrier.trim().toUpperCase();
    }
    if (detail.rbd?.trim()) segment.rbd = detail.rbd.trim().toUpperCase();
    if (detail.departureTime?.trim()) segment.departureTime = detail.departureTime.trim();
    if (detail.arrivalTime?.trim()) segment.arrivalTime = detail.arrivalTime.trim();
    if (detail.groundTransport) segment.groundTransport = true;
    segments.push(segment);
  }
  return segments;
}

export function hasBookingInput(
  legDetails: LegBookingDetails[],
  ticket: TicketContext,
): boolean {
  const legHasData = legDetails.some(
    (d) =>
      d.marketingCarrier?.trim() ||
      d.operatingCarrier?.trim() ||
      d.rbd?.trim() ||
      d.departureTime?.trim() ||
      d.arrivalTime?.trim() ||
      d.groundTransport,
  );
  const ticketHasData = Object.values(ticket).some(
    (v) => v !== undefined && v !== null && v !== "",
  );
  return legHasData || ticketHasData;
}
