import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow large image uploads (10MB body)
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  // Serve generated images from public directory
  images: {
    unoptimized: true,
  },
  // Disable x-powered-by header
  poweredByHeader: false,
};

export default nextConfig;
