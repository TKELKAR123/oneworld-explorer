import type { TicketContext, ValidationResult } from "@oneworld-explorer/core";
import type { LegBookingDetails } from "./segment-booking";
import type { LegNetworkState } from "../hooks/useRouteNetwork";

export type ChecklistRowId = "shape" | "feasibility" | "times" | "carriers" | "ticket";

export type ChecklistStatus = "complete" | "partial" | "pending" | "na";

export interface ChecklistRow {
  id: ChecklistRowId;
  label: string;
  status: ChecklistStatus;
  detail: string;
  focusLegIndex?: number;
}

function countFlightLegs(
  legTypes: ("flight" | "surface")[],
): number {
  return legTypes.filter((t) => t === "flight").length;
}

function firstIncompleteTimesLeg(
  legTypes: ("flight" | "surface")[],
  legDetails: LegBookingDetails[],
): number | undefined {
  for (let i = 0; i < legTypes.length; i++) {
    if (legTypes[i] === "surface") continue;
    const d = legDetails[i];
    if (!d?.departureTime?.trim() || !d?.arrivalTime?.trim()) return i;
  }
  return undefined;
}

function firstIncompleteCarrierLeg(
  legTypes: ("flight" | "surface")[],
  legDetails: LegBookingDetails[],
): number | undefined {
  for (let i = 0; i < legTypes.length; i++) {
    if (legTypes[i] === "surface") continue;
    const d = legDetails[i];
    if (!d?.marketingCarrier?.trim() && !d?.operatingCarrier?.trim()) return i;
  }
  return undefined;
}

export function buildValidationChecklist(input: {
  result: ValidationResult | null;
  stops: string[];
  legTypes: ("flight" | "surface")[];
  legDetails: LegBookingDetails[];
  legNetwork: LegNetworkState[];
  networkLoading: boolean;
  networkError: boolean;
  ticket: TicketContext;
}): ChecklistRow[] {
  const flightCount = countFlightLegs(input.legTypes);
  const timesComplete = input.legDetails.filter(
    (d, i) =>
      input.legTypes[i] === "flight" &&
      d?.departureTime?.trim() &&
      d?.arrivalTime?.trim(),
  ).length;
  const carriersComplete = input.legDetails.filter(
    (d, i) =>
      input.legTypes[i] === "flight" &&
      (d?.marketingCarrier?.trim() || d?.operatingCarrier?.trim()),
  ).length;

  const shapeOk =
    input.result?.valid === true ||
    (input.result?.outcome !== "invalid" && (input.result?.blockingIssueCount ?? 0) === 0);
  const geometryInvalid = input.result?.outcome === "invalid";

  const networkChecked = input.legNetwork.filter(
    (l) => l.feasibility !== "surface" && l.feasibility !== "loading",
  ).length;

  const ticketFilled = Boolean(
    input.ticket.validatingCarrier?.trim() ||
      input.ticket.saleMarket?.trim() ||
      input.ticket.purchasedBeforeDeparture ||
      input.ticket.pnrHasOsiRtw,
  );

  return [
    {
      id: "shape",
      label: "Route shape",
      status: !input.result
        ? "pending"
        : geometryInvalid
          ? "pending"
          : "complete",
      detail: geometryInvalid
        ? "Fix continents, oceans, or return airport"
        : "Continents, direction, and return airport",
    },
    {
      id: "feasibility",
      label: "Flight routes",
      status: input.networkError
        ? "pending"
        : input.networkLoading
          ? "partial"
          : networkChecked >= flightCount && flightCount > 0
            ? "complete"
            : flightCount === 0
              ? "na"
              : "partial",
      detail: input.networkLoading
        ? "Checking published oneworld routes…"
        : `${networkChecked}/${flightCount} legs checked (static network)`,
    },
    {
      id: "times",
      label: "Flight times",
      status:
        flightCount === 0
          ? "na"
          : timesComplete >= flightCount
            ? "complete"
            : timesComplete > 0
              ? "partial"
              : "pending",
      detail:
        timesComplete >= flightCount
          ? "Stopover, min/max stay, and US rules active"
          : `Add times on ${flightCount - timesComplete} leg(s) to check stopovers and stay`,
      focusLegIndex: firstIncompleteTimesLeg(input.legTypes, input.legDetails),
    },
    {
      id: "carriers",
      label: "Airlines",
      status:
        flightCount === 0
          ? "na"
          : carriersComplete >= flightCount
            ? "complete"
            : carriersComplete > 0
              ? "partial"
              : "pending",
      detail:
        carriersComplete >= flightCount
          ? "Carrier and codeshare rules active"
          : `Add airlines on ${flightCount - carriersComplete} leg(s)`,
      focusLegIndex: firstIncompleteCarrierLeg(input.legTypes, input.legDetails),
    },
    {
      id: "ticket",
      label: "Ticket details (agent)",
      status: ticketFilled ? "complete" : "pending",
      detail: ticketFilled
        ? "Stock and ticketing rules can run"
        : "Optional — ticket issued by, sale country, RTW remark",
    },
  ];
}
