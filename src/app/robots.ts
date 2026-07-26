import { MetadataRoute } from 'next';

/**
 * @fileOverview Official Platform Robots Registry Node.
 * UPDATED: Domain synchronized to cracklix.in.
 */

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://cracklix.in';

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
