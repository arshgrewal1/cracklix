import { MetadataRoute } from 'next';

/**
 * @fileOverview Production-Grade PWA Manifest v11.3 (Hardened).
 * BRAND SYSTEM: Icons synchronized with overhauled Cracklix branding.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Cracklix | Punjab Mock Test Platform',
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
        purpose: 'maskable',
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
        purpose: 'maskable',
      },
      {
        src: '/icons/maskable-icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['education', 'lifestyle', 'productivity']
  };
}
