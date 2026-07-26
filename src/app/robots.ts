import { MetadataRoute } from 'next';

/**
 * @fileOverview Official Platform Robots Registry Node.
 * Controls search crawler behavior for the institutional hub.
 */

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://cracklix.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/profile/',
          '/checkout/',
          '/api/',
          '/attempt/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
