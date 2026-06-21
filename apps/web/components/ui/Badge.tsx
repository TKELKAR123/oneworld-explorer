import type { ReactNode } from "react";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "ruleId" | "metric";

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-surface-border text-surface-muted",
  success: "bg-green-900/60 text-green-400",
  warning: "bg-amber-900/60 text-amber-400",
  danger: "bg-red-900/60 text-red-400",
  ruleId: "bg-surface-border/80 font-mono text-[10px] text-surface-muted",
  metric: "bg-surface-card border border-surface-border text-slate-200",
};

export interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
  title?: string;
  "data-testid"?: string;
}

export function Badge({ variant = "default", children, className = "", title, "data-testid": testId }: BadgeProps) {
  return (
    <span
      title={title}
      data-testid={testId}
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
