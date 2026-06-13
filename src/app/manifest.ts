import { MetadataRoute } from 'next';

/**
 * @fileOverview Optimized Institutional PWA Manifest v23.0 (Hardened).
 */
export default function manifest(): MetadataRoute.Manifest {
  const brandIcon = 'https://i.ibb.co/S76nk4XG/IMG-20260613-215742.jpg';

  return {
    name: "Cracklix | Punjab's Mock Test Platform",
    short_name: 'Cracklix',
    description: "Punjab's most trusted government exam preparation platform.",
    start_url: '/',
    id: 'cracklix-hub-v1',
    display: 'standalone',
    background_color: '#0B1528',
    theme_color: '#0B1528',
    orientation: 'portrait',
    icons: [
      {
        src: brandIcon,
        sizes: '192x192',
        type: 'image/jpeg',
        purpose: 'any maskable',
      },
      {
        src: brandIcon,
        sizes: '512x512',
        type: 'image/jpeg',
        purpose: 'any maskable',
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
      {
        name: 'Current Affairs',
        url: '/current-affairs',
        description: 'Daily exam relevant updates',
      },
    ],
    categories: ['education', 'lifestyle'],
    related_applications: [],
    prefer_related_applications: false
  };
}
