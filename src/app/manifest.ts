import { MetadataRoute } from 'next';

/**
 * @fileOverview Hardened PWA Manifest v26.0.
 * Compliance: Separate 'any' and 'maskable' purposes for maximum compatibility.
 */
export default function manifest(): MetadataRoute.Manifest {
  const brandIcon = 'https://i.ibb.co/S76nk4XG/IMG-20260613-215742.jpg';

  return {
    name: "Cracklix | Punjab's Mock Test Platform",
    short_name: 'Cracklix',
    description: "Punjab's most trusted government exam preparation platform.",
    start_url: '/',
    id: 'cracklix-platform-v1',
    scope: '/',
    display: 'standalone',
    display_override: ['standalone', 'window-controls-overlay'],
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
    shortcuts: [
      {
        name: 'Practice Tests',
        url: '/mocks',
        description: 'Browse all available practice tests',
      },
      {
        name: 'My Results',
        url: '/my-exams',
        description: 'Track your preparation progress',
      },
    ],
    categories: ['education', 'lifestyle']
  };
}
