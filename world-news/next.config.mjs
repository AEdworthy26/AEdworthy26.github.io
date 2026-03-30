/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'ichef.bbci.co.uk' },
      { hostname: 'feeds.bbci.co.uk' },
      { hostname: 'images.unsplash.com' },
      { hostname: '*.reuters.com' },
      { hostname: '*.ap.org' },
    ],
  },
}

export default nextConfig
