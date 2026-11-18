import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/work", destination: "/portfolio", permanent: true },
      { source: "/work/:slug", destination: "/portfolio/:slug", permanent: true },
      { source: "/about", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
