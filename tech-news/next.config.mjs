/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'techcrunch.com' },
      { hostname: '*.techcrunch.com' },
      { hostname: 'cdn.vox-cdn.com' },
      { hostname: 'images.unsplash.com' },
      { hostname: 'cdn.arstechnica.net' },
      { hostname: '*.wired.com' },
    ],
  },
}

export default nextConfig
