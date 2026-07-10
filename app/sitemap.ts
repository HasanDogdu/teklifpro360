import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://quote-manager-97.preview.emergentagent.com'
  const now = new Date()
  return [
    { url: `${base}/`,      lastModified: now, changeFrequency: 'monthly',  priority: 1.0 },
    { url: `${base}/login`, lastModified: now, changeFrequency: 'yearly',   priority: 0.9 },
  ]
}
