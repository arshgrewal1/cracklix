import { MetadataRoute } from 'next';

/**
 * @fileOverview Official Robots.txt Node.
 * Ensures only public routes are indexed by search engine nodes.
 */

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://cracklix.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/profile/',
          '/checkout/',
          '/attempt/',
          '/api/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
