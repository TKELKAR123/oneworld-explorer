"use client";

import { useState, type ReactNode } from "react";

export interface AccordionProps {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export function Accordion({
  title,
  children,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  className = "",
}: AccordionProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = controlledOpen ?? internalOpen;

  function toggle() {
    const next = !isOpen;
    setInternalOpen(next);
    onOpenChange?.(next);
  }

  return (
    <div className={`rounded-lg border border-surface-border bg-surface/40 ${className}`}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-slate-200 hover:bg-surface-card/50"
      >
        <span className="flex-1">{title}</span>
        <span className="text-surface-muted" aria-hidden>
          {isOpen ? "▼" : "▶"}
        </span>
      </button>
      {isOpen && <div className="border-t border-surface-border px-4 py-3">{children}</div>}
    </div>
  );
}

export interface AccordionGroupProps {
  expandAll: boolean;
  children: ReactNode;
}

export function useAccordionGroup(defaultExpandAll = false) {
  const [expandAll, setExpandAll] = useState(defaultExpandAll);
  return { expandAll, setExpandAll, toggleExpandAll: () => setExpandAll((v) => !v) };
}
