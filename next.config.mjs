/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimisation — add remote patterns here if you ever
  // pull product images from an external CDN.
  images: {
    formats: ['image/avif', 'image/webp'],
    // Example remote pattern (uncomment if needed):
    // remotePatterns: [
    //   { protocol: 'https', hostname: 'cdn.colicprotocol.com' },
    // ],
  },

  // Strict TypeScript — never silence build errors.
  typescript: {
    ignoreBuildErrors: false,
  },

  // Strict ESLint — catch issues before deploy.
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Security headers — applied to every response.
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },

  // No redirects defined. /checklist, /blueprint, /quiz etc. are all real
  // pages under app/ — do not add a redirect here that shadows any of them.
  // Next.js resolves config-level redirects before file-based routes, so a
  // redirect at the same path as a page silently makes the page unreachable.
}

export default nextConfig
