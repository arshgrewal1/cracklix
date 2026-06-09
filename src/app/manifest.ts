import { MetadataRoute } from 'next';

/**
 * @fileOverview Institutional PWA Manifest Configuration.
 * Standards: W3C Web App Manifest for Next.js 15.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CRACKLIX | Punjab Exam Hub',
    short_name: 'CRACKLIX',
    description: "Punjab's most trusted government exam preparation platform.",
    start_url: '/',
    display: 'standalone',
    background_color: '#FFFFFF',
    theme_color: '#0B1528',
    orientation: 'portrait-primary',
    icons: [
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
    ],
    shortcuts: [
      {
        name: 'My Exams',
        url: '/my-exams',
        icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'Mock Tests',
        url: '/mocks',
        icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }],
      },
    ],
  };
}
