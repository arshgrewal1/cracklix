import { MetadataRoute } from 'next';

/**
 * @fileOverview Official Platform Robots Registry Node v2.0.
 * UPDATED: Standardized rules to allow AdSense crawlers and public preparation hubs.
 */

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://cracklix.in';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/exams',
          '/mocks',
          '/current-affairs',
          '/pyqs',
          '/notes',
          '/vacancies',
          '/exam-calendar',
          '/meet-founder',
          '/about',
          '/faq',
        ],
        disallow: [
          '/admin/',
          '/profile/',
          '/checkout/',
          '/api/',
          '/attempt/',
          '/results/view', // Private result nodes
          '/login',
          '/profile-setup'
        ],
      },
      {
        // Explicitly allow AdSense crawler to review content
        userAgent: 'Mediapartners-Google',
        allow: '/',
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
