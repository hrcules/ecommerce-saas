import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["lvh.me", "*.lvh.me", "localhost", "*.localhost"],

  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d4lgxe9bm8juw.cloudfront.net",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "pub-d06f2051314340b49678a4b47d8e3970.r2.dev",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
