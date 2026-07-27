import { MetadataRoute } from 'next';

/**
 * @fileOverview Dynamic Sitemap Generator Hub v2.0.
 * UPDATED: Included all public preparation and institutional routes.
 */

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://cracklix.in';
  const now = new Date();

  // Primary Landing Hubs
  const staticRoutes = [
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
    '/install',
    '/leaderboard',
    '/pricing',
    '/privacy',
    '/terms',
    '/study-material'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // Note: Dynamic routes for [id] can be added here by fetching IDs from Firestore if required 
  // for a full server-side deployment. For the current hybrid build, static routes cover 90% of SEO value.

  return staticRoutes;
}
