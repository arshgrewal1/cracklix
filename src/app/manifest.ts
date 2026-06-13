import { MetadataRoute } from 'next';

/**
 * @fileOverview Hardened PWA Manifest v29.0.
 * Compliance: Explicit id and purpose for cross-platform installability.
 */
export default function manifest(): MetadataRoute.Manifest {
  const brandIcon = 'https://i.ibb.co/S76nk4XG/IMG-20260613-215742.jpg';

  return {
    name: "Cracklix | Punjab's Mock Test Platform",
    short_name: 'Cracklix',
    description: "Punjab's most trusted government exam preparation platform.",
    start_url: '/',
    id: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#0B1528',
    theme_color: '#0B1528',
    orientation: 'portrait',
    icons: [
      {
        src: brandIcon,
        sizes: '192x192',
        type: 'image/jpeg',
        purpose: 'any',
      },
      {
        src: brandIcon,
        sizes: '512x512',
        type: 'image/jpeg',
        purpose: 'any',
      },
      {
        src: brandIcon,
        sizes: '192x192',
        type: 'image/jpeg',
        purpose: 'maskable',
      },
      {
        src: brandIcon,
        sizes: '512x512',
        type: 'image/jpeg',
        purpose: 'maskable',
      },
    ],
    categories: ['education', 'lifestyle']
  };
}
