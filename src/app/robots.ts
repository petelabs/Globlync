import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/privacy', '/terms', '/contact', '/search', '/pricing'],
      disallow: ['/dashboard/', '/profile/', '/notifications/'],
    },
    sitemap: 'https://globlync.vercel.app/sitemap.xml',
  }
}
