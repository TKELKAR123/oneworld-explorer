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

export default function GlobalError({
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
      // sessionStorage unavailable — fall through to manual reload UI
    }
  }, [error]);

  const chunkError = isChunkLoadError(error);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-slate-100">
        <h1 className="text-lg font-semibold">
          {chunkError ? "App updated — reload needed" : "Something went wrong"}
        </h1>
        <p className="mt-2 max-w-md text-center text-sm text-slate-400">
          {chunkError
            ? "A newer version of the app is available. This usually happens after code changes in development."
            : error.message || "An unexpected error occurred."}
        </p>
        <button
          type="button"
          className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
          onClick={() => {
            try {
              sessionStorage.removeItem(RELOAD_KEY);
            } catch {
              /* ignore */
            }
            if (chunkError) {
              window.location.reload();
            } else {
              reset();
            }
          }}
        >
          Reload app
        </button>
      </body>
    </html>
  );
}
