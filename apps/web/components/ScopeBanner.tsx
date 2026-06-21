import { RULES_VERSION } from "../lib/explorer-constants";

export function ScopeBanner() {
  return (
    <div
      className="border-b border-amber-900/50 bg-amber-950/40 px-4 py-2 text-sm text-amber-100"
      role="status"
    >
      <span className="font-medium">Zero-API RTW compliance explorer</span>
      <span className="text-amber-200/80">
        {" "}
        — structural routing always on; search flights on Google and paste times here for booking
        rules. Not pricing or availability. Tariff {RULES_VERSION}.
      </span>
    </div>
  );
}
