"use client";

import { useEffect } from "react";

const RELOAD_KEY = "oneworld-explorer-chunk-reload";

function isChunkLoadError(error: Error): boolean {
  const msg = error.message ?? "";
  return (
    error.name === "ChunkLoadError" ||
    msg.includes("Loading chunk") ||
    msg.includes("Failed to fetch dynamically imported module")
  );
}

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (!isChunkLoadError(error)) return;
    try {
      if (sessionStorage.getItem(RELOAD_KEY)) return;
      sessionStorage.setItem(RELOAD_KEY, "1");
      window.location.reload();
    } catch {
      /* fall through */
    }
  }, [error]);

  const chunkError = isChunkLoadError(error);

  return (
    <div className="mx-auto max-w-lg px-4 py-12 text-center">
      <h2 className="text-lg font-semibold text-slate-100">
        {chunkError ? "App updated — reload needed" : "Something went wrong"}
      </h2>
      <p className="mt-2 text-sm text-surface-muted">
        {chunkError
          ? "Reload to pick up the latest code. In dev, run npm run dev:clean if this keeps happening."
          : error.message}
      </p>
      <button
        type="button"
        className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500"
        onClick={() => {
          try {
            sessionStorage.removeItem(RELOAD_KEY);
          } catch {
            /* ignore */
          }
          if (chunkError) window.location.reload();
          else reset();
        }}
      >
        Reload app
      </button>
    </div>
  );
}
