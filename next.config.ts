import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // serverComponentsExternalPackages sudah deprecated
    // pindah ke serverExternalPackages
  },
  serverExternalPackages: [
    '@prisma/client',
    'prisma',
    'bcryptjs',
    'jsonwebtoken'
  ],
  images: {
    domains: [
      'res.cloudinary.com', 
      'avatars.githubusercontent.com', 
      'lh3.googleusercontent.com',
      'images.unsplash.com',
      'via.placeholder.com'
    ],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  webpack: (config: any) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }
    return config
  }
}

export default nextConfig;
