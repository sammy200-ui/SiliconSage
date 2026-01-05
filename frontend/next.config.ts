import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Set the correct root directory to avoid lockfile conflicts
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
