/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // AVIF (najmniejsze pliki) z fallbackiem WebP — wybór wg nagłówka Accept przeglądarki.
    formats: ['image/avif', 'image/webp'],
    // 80 dla hero (duże, ostre zdjęcie), 75 domyślnie dla reszty.
    qualities: [75, 80],
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
