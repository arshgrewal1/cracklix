import { MetadataRoute } from 'next';

/**
 * @fileOverview Dynamic Sitemap Generator Hub.
 * UPDATED: Domain synchronized to cracklix.in.
 */

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://cracklix.in';
  const now = new Date();

  const routes = [
    '',
    '/exams',
    '/mocks',
    '/current-affairs',
    '/pyqs',
    '/notes',
    '/vacancies',
    '/exam-calendar',
    '/meet-founder',
    '/about',
    '/contact',
    '/faq',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  return routes;
}
