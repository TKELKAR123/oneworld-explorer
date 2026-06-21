/** Parse a single-line leg paste e.g. "BA178 10:00→18:30" or "BA 178 2026-09-15T10:00". */
export function parseLegPaste(line: string): {
  marketingCarrier?: string;
  flightNumber?: string;
  departureTime?: string;
  arrivalTime?: string;
} | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const arrowMatch = trimmed.match(
    /^([A-Z0-9]{2})\s*(\d+[A-Z]?)\s+(\d{1,2}:\d{2})\s*[→\-–]\s*(\d{1,2}:\d{2})/i,
  );
  if (arrowMatch) {
    const [, carrier, num, dep, arr] = arrowMatch;
    const today = new Date().toISOString().slice(0, 10);
    return {
      marketingCarrier: carrier!.toUpperCase(),
      flightNumber: `${carrier!.toUpperCase()}${num}`,
      departureTime: `${today}T${dep}:00`,
      arrivalTime: `${today}T${arr}:00`,
    };
  }

  const isoMatch = trimmed.match(
    /^([A-Z0-9]{2})\s*(\d+[A-Z]?)\s+(\d{4}-\d{2}-\d{2}T[\d:]+)/i,
  );
  if (isoMatch) {
    const [, carrier, num, depIso] = isoMatch;
    return {
      marketingCarrier: carrier!.toUpperCase(),
      flightNumber: `${carrier!.toUpperCase()}${num}`,
      departureTime: depIso,
    };
  }

  return null;
}
