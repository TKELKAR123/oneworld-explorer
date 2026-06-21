import type { ReactNode } from "react";

export interface MetricPillProps {
  label?: string;
  value: ReactNode;
  mono?: boolean;
  title?: string;
  className?: string;
}

export function MetricPill({ label, value, mono, title, className = "" }: MetricPillProps) {
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1.5 rounded-full border border-surface-border bg-surface-card px-3 py-1 text-sm ${className}`}
    >
      {label && <span className="text-surface-muted">{label}</span>}
      <span className={mono ? "font-mono font-medium text-slate-100" : "text-slate-200"}>
        {value}
      </span>
    </span>
  );
}

export function MetricDivider() {
  return <span className="hidden h-5 w-px bg-surface-border sm:block" aria-hidden />;
}
