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
  // /quiz is intentionally redirected to the static standalone assessment
  // at /colic-code-quiz.html. app/quiz/page.tsx still exists in the repo
  // but is now unreachable — this redirect takes priority over it.
  async redirects() {
    return [
      {
        source: '/quiz',
        destination: '/colic-code-quiz.html',
        permanent: true,
      },
    ]
  },
}
export default nextConfig