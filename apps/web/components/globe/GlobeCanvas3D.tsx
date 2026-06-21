"use client";

import dynamic from "next/dynamic";
import type { GlobeCanvas3DInnerProps } from "./GlobeCanvas3DInner";

const GlobeCanvas3DInner = dynamic(() => import("./GlobeCanvas3DInner"), {
  ssr: false,
  loading: () => (
    <div
      className="flex items-center justify-center rounded-lg bg-[#0c1220] text-sm text-surface-muted"
      style={{ minHeight: 320 }}
      data-testid="globe-canvas-loading"
    >
      Loading 3D globe…
    </div>
  ),
});

export function GlobeCanvas3D(props: GlobeCanvas3DInnerProps) {
  return <GlobeCanvas3DInner {...props} />;
}
