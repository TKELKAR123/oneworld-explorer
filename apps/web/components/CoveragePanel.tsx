"use client";

export function CoveragePanel() {
  return (
    <details className="border-b border-surface-border bg-surface-card/30 px-4 py-2">
      <summary className="cursor-pointer text-sm font-medium text-slate-200">
        What this tool checks (and what it doesn&apos;t)
      </summary>
      <div className="mt-3 space-y-3 pb-2 text-sm text-slate-300">
        <div>
          <p className="font-medium text-slate-200">Tier 1 — Always on (zero API)</p>
          <ul className="mt-1 list-inside list-disc text-slate-400">
            <li>Continents, direction, Atlantic + Pacific crossings</li>
            <li>§4(c) origin–return, segment budgets, duplicate sectors</li>
            <li>FlightsFrom weekly route index (direct carriers + 1-stop hubs)</li>
            <li>Fare basis hint (LONE/DONE/AONE) from continents + class</li>
          </ul>
        </div>
        <div>
          <p className="font-medium text-slate-200">Tier 2 — Paste schedule &amp; carriers</p>
          <ul className="mt-1 list-inside list-disc text-slate-400">
            <li>Eligible carriers, codeshares, and affiliates</li>
            <li>Stopovers (24h rule, minimum 2), min/max stay</li>
            <li>Booking classes (RBD) and ticket stock rules</li>
          </ul>
        </div>
        <div>
          <p className="font-medium text-slate-200">Tier 3 — Self-declared stop intent</p>
          <ul className="mt-1 list-inside list-disc text-slate-400">
            <li>Mark stopover vs connection when times unknown (provisional §8 hints)</li>
          </ul>
        </div>
        <div>
          <p className="font-medium text-slate-200">Tier 4 — External search (links only)</p>
          <ul className="mt-1 list-inside list-disc text-slate-400">
            <li>Google Flights, FlightsFrom, FlightConnections — we do not call their APIs</li>
          </ul>
        </div>
        <div>
          <p className="font-medium text-slate-200">Not covered</p>
          <ul className="mt-1 list-inside list-disc text-slate-400">
            <li>Price quotes, taxes, surcharges, or change fees</li>
            <li>Seat availability or live inventory</li>
            <li>GDS booking or full PNR import</li>
          </ul>
        </div>
        <p className="text-caption text-slate-500">
          Based on oneworld Explorer Rule 3015 (Feb 2026).{" "}
          <a
            href="https://assets.ctfassets.net/m9ph4qvas97u/58dSxVDQ0kjLFD2Dsxpo6m/0ae0e100a274267777529778cbe91473/oneworld_Explorer_27_FEB_26.pdf"
            className="text-amber-300/90 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Official PDF
          </a>
        </p>
      </div>
    </details>
  );
}
