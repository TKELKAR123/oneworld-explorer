"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

export interface GlobeFullscreenOverlayProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function GlobeFullscreenOverlay({ open, onClose, children }: GlobeFullscreenOverlayProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex flex-col bg-[#030508]/98"
      data-testid="globe-fullscreen-overlay"
    >
      <div className="flex items-center justify-between border-b border-surface-border px-4 py-2">
        <span className="text-sm font-medium text-slate-200">Globe explorer</span>
        <button
          type="button"
          onClick={onClose}
          data-testid="globe-fullscreen-close"
          className="rounded-md border border-surface-border px-3 py-1 text-xs text-surface-muted hover:text-slate-200"
        >
          Close (Esc)
        </button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col p-4">{children}</div>
    </div>,
    document.body,
  );
}
