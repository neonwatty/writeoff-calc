import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site-config'
import { posts } from '@/lib/blog'

export default function sitemap(): MetadataRoute.Sitemap {
  const blogEntries = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.date,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [
    { url: SITE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/calculators`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/calculators/write-off`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/calculators/home-office`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/calculators/quarterly-estimates`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/calculators/profile`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/blog`, changeFrequency: 'weekly', priority: 0.8 },
    ...blogEntries,
  ]
}
