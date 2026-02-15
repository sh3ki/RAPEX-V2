/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  },
  // Next.js 16 uses Turbopack by default
  // Add Turbopack config for Docker development
  turbopack: {
    // Turbopack configurations for Docker file watching
    resolveAlias: {},
  },
  // Keep webpack config for backwards compatibility
  webpack: (config, { isServer }) => {
    // Fix file watching in Docker (especially on Windows)
    config.watchOptions = {
      poll: 1000, // Check for changes every second
      aggregateTimeout: 300,
      ignored: ['**/node_modules', '**/.next', '**/.git'],
    }
    
    // Suppress filesystem watching errors in Docker
    if (!isServer) {
      config.infrastructureLogging = {
        level: 'error',
      }
    }
    
    return config
  },
  // Suppress build warnings and unnecessary logs
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  // Disable x-powered-by header
  poweredByHeader: false,
  // Output standalone for better Docker performance
  output: 'standalone',
}

module.exports = nextConfig
