import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Globlync | Global Evidence-Based Reputation',
    short_name: 'Globlync',
    description: 'Build your digital, evidence-based professional reputation. Headquartered in Malawi, serving the globe.',
    start_url: '/',
    id: '/',
    display: 'standalone',
    background_color: '#FDFDFD',
    theme_color: '#00796B',
    orientation: 'portrait',
    scope: '/',
    categories: ['business', 'productivity', 'social'],
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      },
    ],
    shortcuts: [
      {
        name: 'My Professional Hub',
        short_name: 'My Hub',
        description: 'Manage your trust score and ID card',
        url: '/profile',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }]
      },
      {
        name: 'Search Professionals',
        short_name: 'Directory',
        description: 'Find verified pros in Malawi',
        url: '/search',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }]
      }
    ],
    screenshots: [
      {
        src: 'https://picsum.photos/seed/globlync1/1080/1920',
        sizes: '1080x1920',
        type: 'image/png',
        label: 'Professional Evidence Hub'
      }
    ]
  }
}