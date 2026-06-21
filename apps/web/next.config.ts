import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@oneworld-explorer/core", "@oneworld-explorer/schedules"],
};

export default nextConfig;
