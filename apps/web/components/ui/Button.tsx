"use client";

import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50",
  secondary:
    "border border-surface-border bg-surface-card text-slate-200 hover:bg-surface-border/60 disabled:opacity-50",
  ghost: "text-surface-muted hover:bg-surface-card hover:text-slate-200 disabled:opacity-50",
  danger: "bg-red-900/60 text-red-200 hover:bg-red-900/80 disabled:opacity-50",
};

const sizeClasses = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: keyof typeof sizeClasses;
  children: ReactNode;
}

function handleClick(
  event: MouseEvent<HTMLButtonElement>,
  onClick: ButtonHTMLAttributes<HTMLButtonElement>["onClick"],
) {
  if (!onClick) return;
  void Promise.resolve(onClick(event)).catch((err: unknown) => {
    console.error("[Button] async onClick failed:", err);
  });
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  onClick,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick ? (e) => handleClick(e, onClick) : undefined}
      {...props}
    >
      {children}
    </button>
  );
}
