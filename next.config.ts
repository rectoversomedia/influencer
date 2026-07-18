import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Set root directory to this project
  experimental: {
    // Enable Turbopack
  },
  // Exclude other project directories
  onDemandEntries: {
    // Exclude paths from other projects
  },
  // Supabase env vars are handled via .env.local
};

export default nextConfig;
