import { MetadataRoute } from 'next';

/**
 * @fileOverview Production-Grade PWA Manifest v15.0.
 * FIXED: Optimized icon purpose and scale for Android/iOS home screens.
 * NOTE: Ensure the source icon has minimal transparent padding for maximum visibility.
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
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      }
    ],
    categories: ['education', 'lifestyle', 'productivity']
  };
}
