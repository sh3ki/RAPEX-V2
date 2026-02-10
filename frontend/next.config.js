/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  },
  // Optimize for Docker development
  webpack: (config, { isServer }) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    }
    
    // Suppress React DevTools suggestion in development
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'react-dom$': 'react-dom/profiling',
      }
    }
    
    return config
  },
  // Suppress build warnings
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
}

module.exports = nextConfig
