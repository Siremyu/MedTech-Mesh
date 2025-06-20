import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Enable server components optimizations
    serverComponentsExternalPackages: ['three']
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.myanimelist.net',
        port: '',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: '*.myanimelist.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Add support for 3D model files and proper headers
  async headers() {
    return [
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin',
          },
        ],
      },
    ]
  },

  // Handle 3D file extensions in static serving
  async rewrites() {
    return [
      {
        source: '/models/:path*',
        destination: '/api/files/models/:path*',
      },
    ]
  },

  // Webpack configuration for Three.js
  webpack: (config, { isServer }) => {
    // Handle Three.js modules
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      use: ['raw-loader'],
    })

    // Handle 3D model files
    config.module.rules.push({
      test: /\.(stl|obj|gltf|glb)$/,
      use: ['file-loader'],
    })

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      }
    }

    return config
  },
}

export default nextConfig;
