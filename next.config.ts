import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Enable Turbopack
  },
  turbopack: {
    root: '/Users/fajarpahlawan/rectoverso-influencer',
  },
};

export default nextConfig;
