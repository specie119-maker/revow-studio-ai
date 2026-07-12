import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://revow-studio.com'; // Change to actual production URL

  // Fetch all stories for dynamic sitemap
  const stories = await prisma.story.findMany({
    select: { id: true, createdAt: true },
  });

  const storyUrls = stories.map((story) => ({
    url: `${baseUrl}/story/${story.id}`,
    lastModified: story.createdAt,
    changeFrequency: 'never' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...storyUrls,
  ];
}
