const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,

  // Server Actions & external origins
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        'quote-manager-97.preview.emergentagent.com',
        'quote-manager-97.cluster-12.preview.emergentcf.cloud',
        '*.preview.emergentagent.com',
        '*.preview.emergentcf.cloud',
        '*.emergentagent.com',
        '*.emergentcf.cloud',
      ],
    },
  },
  allowedDevOrigins: [
    'quote-manager-97.preview.emergentagent.com',
    'quote-manager-97.cluster-12.preview.emergentcf.cloud',
    '*.preview.emergentagent.com',
    '*.preview.emergentcf.cloud',
  ],

  // Remote images (Supabase Storage for company logos)
  images: {
    formats: ['image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: '*.supabase.in' },
    ],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options',         value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy',         value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',      value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          { key: 'Content-Type',  value: 'application/javascript; charset=utf-8' },
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      {
        source: '/manifest.webmanifest',
        headers: [{ key: 'Content-Type', value: 'application/manifest+json' }],
      },
    ]
  },

  // Ignore TS/ESLint on prod build (already linted separately)
  eslint:     { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors:  true },

  webpack: (config, { isServer }) => {
    // React-PDF requires this for browser bundle
    if (!isServer) {
      config.resolve.fallback = { ...config.resolve.fallback, fs: false, path: false }
    }
    return config
  },

  async rewrites() {
    return []
  },
}

module.exports = nextConfig
