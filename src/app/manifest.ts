
import { MetadataRoute } from 'next';

/**
 * @fileOverview Institutional PWA Manifest Configuration v4.0.
 * Hardened to meet strict Chrome/Android installability criteria.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CRACKLIX | Punjab Exam Hub',
    short_name: 'CRACKLIX',
    description: "Punjab's most trusted government exam preparation platform.",
    start_url: '/',
    id: '/',
    display: 'standalone',
    background_color: '#0B1528',
    theme_color: '#0B1528',
    orientation: 'portrait',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'My Exams',
        url: '/my-exams',
        description: 'View your pinned exam hubs',
      },
      {
        name: 'Mock Tests',
        url: '/mocks',
        description: 'Browse all available practice tests',
      },
    ],
  };
}
