import { describe, expect, it } from "vitest";
import {
  flightConnectionsLeg,
  flightsFromLeg,
  googleFlightsLeg,
  oneworldRtwBook,
} from "../../apps/web/lib/external-search-links";

describe("external-search-links", () => {
  it("builds Google Flights deep link with date and class", () => {
    const url = googleFlightsLeg("lhr", "jfk", "2026-09-15", "business");
    expect(url).toMatch(/^https:\/\/www\.google\.com\/travel\/flights\?/);
    expect(url).toContain("q=");
    expect(decodeURIComponent(url)).toMatch(/LHR/i);
    expect(decodeURIComponent(url)).toMatch(/JFK/i);
    expect(decodeURIComponent(url)).toMatch(/business/i);
  });

  it("builds FlightsFrom timetable URL", () => {
    expect(flightsFromLeg("sin", "syd")).toBe("https://www.flightsfrom.com/SIN-SYD");
  });

  it("builds FlightConnections route URL", () => {
    expect(flightConnectionsLeg("LHR", "SIN")).toBe(
      "https://www.flightconnections.com/?origin=lhr&destination=sin",
    );
  });

  it("returns oneworld RTW book URL", () => {
    expect(oneworldRtwBook()).toBe("https://rtw.oneworld.com/");
  });
});
