/** @type {import('next').NextConfig} */
const nextConfig = {
    // Build optimizations
    eslint: {
      ignoreDuringBuilds: true, // Keep this for faster builds
    },
    typescript: {
      ignoreBuildErrors: false, // Set to true only if you have TypeScript issues
    },
  
    // Performance optimizations
    experimental: {
      optimizePackageImports: ['lucide-react', 'date-fns'], // Optimize commonly used packages
    },
  
    // Image optimization (if you plan to use images)
    images: {
      formats: ['image/webp', 'image/avif'],
      deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
      imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    },
  
    // Compiler optimizations
    compiler: {
      removeConsole: process.env.NODE_ENV === 'production', // Remove console.logs in production
    },
  
    // Output configuration for better Vercel compatibility
    output: 'standalone', // Recommended for Vercel deployments
  
    // Headers for security and performance
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff',
            },
            {
              key: 'X-Frame-Options',
              value: 'DENY',
            },
            {
              key: 'X-XSS-Protection',
              value: '1; mode=block',
            },
          ],
        },
      ]
    },
  
    // Redirects (if needed)
    async redirects() {
      return [
        // Add any redirects here if needed
        // {
        //   source: '/old-path',
        //   destination: '/new-path',
        //   permanent: true,
        // },
      ]
    },
  
    // Environment variables validation (optional but recommended)
    env: {
      CUSTOM_KEY: process.env.CUSTOM_KEY,
    },
  }
  
  module.exports = nextConfig