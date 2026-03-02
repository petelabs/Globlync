
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Manifest {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/profile/'],
    },
    sitemap: 'https://globlync.vercel.app/sitemap.xml',
  }
}
