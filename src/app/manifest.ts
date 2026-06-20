import { MetadataRoute } from 'next';

/**
 * @fileOverview Production-Grade PWA Manifest v14.0.
 * FIXED: Set purpose to 'any' for primary icons to prevent circular clipping of the "C" ring.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cracklix | Punjab's Smart Mock Test Platform",
    short_name: 'Cracklix',
    description: "Punjab's most trusted government exam preparation platform. PSSSB, PPSC, Punjab Police, and more.",
    start_url: '/',
    id: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#FFFFFF',
    theme_color: '#1677FF',
    orientation: 'portrait',
    icons: [
      {
        src: '/logo/cracklix-icon.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/logo/cracklix-icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/logo/cracklix-icon.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/logo/cracklix-icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      }
    ],
    categories: ['education', 'lifestyle', 'productivity']
  };
}
