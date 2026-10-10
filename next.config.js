/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        // Zdjęcia ofert importowanych z nieruchomosci-online.pl (scripts/sync-nieruchomosci-online.mjs)
        protocol: 'https',
        hostname: 'i.st-nieruchomosci-online.pl',
      },
    ],
  },
}

module.exports = nextConfig
