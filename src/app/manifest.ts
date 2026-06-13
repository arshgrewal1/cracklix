import { MetadataRoute } from 'next';

/**
 * @fileOverview Production-Grade PWA Manifest v3.0.
 */
export default function manifest(): MetadataRoute.Manifest {
  const brandIcon = 'https://i.ibb.co/S76nk4XG/IMG-20260613-215742.jpg';

  return {
    name: 'Cracklix',
    short_name: 'Cracklix',
    description: "Punjab's most trusted government exam preparation platform.",
    start_url: '/',
    id: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#081a3a',
    theme_color: '#081a3a',
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
