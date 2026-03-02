import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Globlync | Evidence-Based Reputation',
    short_name: 'Globlync',
    description: 'Verifiable trust and digital reputation for skilled informal workers.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FDFDFD',
    theme_color: '#00796B',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
