
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
        src: 'https://picsum.photos/seed/globlync-icon-192/192/192',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'https://picsum.photos/seed/globlync-icon-512/512/512',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
