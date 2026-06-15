"use client";

import { useState } from "react";
import type {
  RouteSegment,
  TravelClass,
  ValidationIssue,
  ValidationResult,
} from "@oneworld-explorer/core";
import { AirportInput } from "../components/AirportInput";

const DEFAULT_SEGMENTS: RouteSegment[] = [
  { from: "JFK", to: "LHR" },
  { from: "LHR", to: "DXB" },
  { from: "DXB", to: "SIN" },
  { from: "SIN", to: "SYD" },
  { from: "SYD", to: "LAX" },
  { from: "LAX", to: "JFK" },
];

const CATEGORY_ORDER = ["routing", "pricing", "carrier", "ticketing", "sales", "geography"];

function groupIssues(issues: ValidationIssue[]): Map<string, ValidationIssue[]> {
  const map = new Map<string, ValidationIssue[]>();
  for (const issue of issues) {
    const cat = issue.category ?? "other";
    const list = map.get(cat) ?? [];
    list.push(issue);
    map.set(cat, list);
  }
  return map;
}

export default function HomePage() {
  const [segments, setSegments] = useState<RouteSegment[]>(DEFAULT_SEGMENTS);
  const [travelClass, setTravelClass] = useState<TravelClass>("economy");
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function validate() {
    setLoading(true);
    try {
      const res = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ travelClass, segments }),
      });
      setResult(await res.json());
    } finally {
      setLoading(false);
    }
  }

  function updateSegment(index: number, patch: Partial<RouteSegment>) {
    setSegments((prev) =>
      prev.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    );
  }

  function addSegment() {
    const last = segments[segments.length - 1];
    setSegments((prev) => [...prev, { from: last?.to ?? "JFK", to: "LHR" }]);
  }

  function removeSegment(index: number) {
    setSegments((prev) => prev.filter((_, i) => i !== index));
  }

  const grouped = result ? groupIssues(result.issues) : null;

  return (
    <main>
      <h1>oneworld Explorer</h1>
      <p className="subtitle">
        Build a route and validate against{" "}
        <a href="https://assets.ctfassets.net/m9ph4qvas97u/58dSxVDQ0kjLFD2Dsxpo6m/0ae0e100a274267777529778cbe91473/oneworld_Explorer_27_FEB_26.pdf">
          Rule 3015
        </a>{" "}
        (geometry v0.1).
      </p>

      <div className="card">
        <label htmlFor="class">Travel class</label>
        <select
          id="class"
          value={travelClass}
          onChange={(e) => setTravelClass(e.target.value as TravelClass)}
        >
          <option value="economy">Economy</option>
          <option value="premium-economy">Premium Economy</option>
          <option value="business">Business</option>
          <option value="first">First</option>
        </select>

        <h2 className="section-title">Segments</h2>
        {segments.map((seg, i) => (
          <div className="row" key={i}>
            <AirportInput
              label="From"
              value={seg.from}
              onChange={(iata) => updateSegment(i, { from: iata })}
            />
            <AirportInput
              label="To"
              value={seg.to}
              onChange={(iata) => updateSegment(i, { to: iata })}
            />
            <label className="checkbox">
              <input
                type="checkbox"
                checked={Boolean(seg.surface)}
                onChange={(e) => updateSegment(i, { surface: e.target.checked })}
              />
              Surface
            </label>
            <button type="button" className="danger" onClick={() => removeSegment(i)}>
              Remove
            </button>
          </div>
        ))}

        <div className="actions">
          <button type="button" className="secondary" onClick={addSegment}>
            Add segment
          </button>
          <button type="button" onClick={validate} disabled={loading}>
            {loading ? "Validating…" : "Validate route"}
          </button>
        </div>
      </div>

      {result && (
        <>
          <div className="card">
            <p className={result.valid ? "valid" : "invalid"}>
              {result.valid ? "Valid" : "Invalid"} · rules {result.rulesVersion}
            </p>
            {result.analysis && (
              <div className="meta">
                <span>{result.analysis.continentCount} continents charged</span>
                <span>{result.analysis.totalSegments} segments</span>
                {result.analysis.suggestedFareBasis && (
                  <span>Fare basis: {result.analysis.suggestedFareBasis}</span>
                )}
                {result.analysis.direction && (
                  <span>Direction: {result.analysis.direction}</span>
                )}
                {result.analysis.crossesAtlantic && <span>Atlantic ✓</span>}
                {result.analysis.crossesPacific && <span>Pacific ✓</span>}
              </div>
            )}
            {result.analysis && (
              <div className="budget-grid">
                <h3 className="section-title">Segment budgets (free intra-continental flights)</h3>
                {Object.entries(result.analysis.flightSegmentsByContinent).map(([c, used]) => {
                  const limit = c === "north-america" ? 6 : 4;
                  return (
                    <div key={c} className={used > limit ? "budget over" : "budget"}>
                      {c}: {used}/{limit}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="section-title">Validation</h2>
            {result.issues.length === 0 && <p>No issues.</p>}
            {grouped &&
              CATEGORY_ORDER.filter((c) => grouped.has(c))
                .concat([...grouped.keys()].filter((c) => !CATEGORY_ORDER.includes(c)))
                .map((category) => (
                  <section key={category} className="issue-group">
                    <h3>{category}</h3>
                    {(grouped.get(category) ?? []).map((issue, i) => (
                      <div key={i} className={`issue ${issue.severity}`}>
                        <div className="issue-header">
                          <strong>{issue.code}</strong>
                          {issue.pdfRef && <span className="pdf-ref">{issue.pdfRef}</span>}
                        </div>
                        {issue.naturalLanguage && (
                          <p className="issue-nl">{issue.naturalLanguage}</p>
                        )}
                        <p>{issue.message}</p>
                        {issue.evidence && issue.evidence.length > 0 && (
                          <ul className="trace">
                            {issue.evidence.map((e, j) => (
                              <li key={j}>{e}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </section>
                ))}
          </div>
        </>
      )}
    </main>
  );
}
