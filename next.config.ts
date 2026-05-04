import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/Sahayak-AI',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
