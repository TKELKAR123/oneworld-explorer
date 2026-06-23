import { describe, expect, it } from "vitest";
import { formatRouteText, parseRouteText } from "../src/parse-route-text.js";

const SC001 = ["JFK", "LHR", "DOH", "SIN", "SYD", "LAX", "JFK"];

describe("parseRouteText", () => {
  it("parses dash chain SC-001", () => {
    const r = parseRouteText("JFK-LHR-DOH-SIN-SYD-LAX-JFK");
    expect(r.stops).toEqual(SC001);
    expect(r.legTypes.every((t) => t === "flight")).toBe(true);
    expect(r.parseIssues).toHaveLength(0);
  });

  it("parses slash and whitespace separators", () => {
    expect(parseRouteText("JFK/LHR/DOH").stops).toEqual(["JFK", "LHR", "DOH"]);
    expect(parseRouteText("JFK LHR DOH").stops).toEqual(["JFK", "LHR", "DOH"]);
  });

  it("parses connection intent (x)", () => {
    const r = parseRouteText("JFK-LHR(x)-DOH-SIN");
    expect(r.stops).toEqual(["JFK", "LHR", "DOH", "SIN"]);
    expect(r.stopIntents[1]).toBe("connection");
  });

  it("parses surface leg", () => {
    const r = parseRouteText("JFK-LHR-[surface]-PAR");
    expect(r.stops).toEqual(["JFK", "LHR", "PAR"]);
    expect(r.legTypes).toEqual(["flight", "surface"]);
  });

  it("round-trips SC-001", () => {
    const text = formatRouteText(SC001);
    expect(text).toBe("JFK-LHR-DOH-SIN-SYD-LAX-JFK");
    expect(parseRouteText(text).stops).toEqual(SC001);
  });

  it("reports unknown tokens", () => {
    const r = parseRouteText("JFK-XXXX-LHR");
    expect(r.parseIssues.length).toBeGreaterThan(0);
    expect(r.stops).toEqual(["JFK", "LHR"]);
  });

  it("ignores comment lines", () => {
    const r = parseRouteText("# classic RTW\nJFK-LHR-DOH");
    expect(r.stops).toEqual(["JFK", "LHR", "DOH"]);
  });
});
