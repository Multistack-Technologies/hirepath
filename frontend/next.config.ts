import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 output: 'standalone',
 
    eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
    images: {
    domains: [
      'http://localhost',
      'http://127.0.0.1',
      'your-backend-domain.com',
      "http://hirepath.co.za",
      "https://hirepath.co.za",
      "https://www.hirepath.co.za"
      // Add all domains where your images are hosted
    ],
  }
};

export default nextConfig;
