/**
 * Web app manifest: makes xaa.es installable on phones and desktops. It opens
 * full screen, without the browser bar (owner, 20 Oct 2026).
 */
import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/?app=xaa',
    name: 'XAA.es — web development studio',
    short_name: 'XAA',
    description: SITE.description,
    lang: 'en',
    start_url: '/?source=pwa',
    scope: '/',
    display: 'standalone',
    display_override: ['standalone', 'minimal-ui'],
    orientation: 'any',
    background_color: '#0b1533',
    theme_color: '#0b1533',
    categories: ['business', 'productivity', 'developer'],
    icons: [
      { src: '/pwa/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/pwa/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/pwa/maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/pwa/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'SaaS templates', short_name: 'Templates', url: '/templates?source=pwa' },
      { name: 'Client portal', short_name: 'Portal', url: '/portal?source=pwa' },
      { name: 'Start a project', short_name: 'Start', url: '/register?source=pwa' },
      { name: 'Contact', short_name: 'Contact', url: '/contact?source=pwa' },
    ],
    // Lets Chrome tell the page that the app is already installed, so the install bar hides itself.
    related_applications: [{ platform: 'webapp', url: `${SITE.url}/manifest.webmanifest` }],
    prefer_related_applications: false,
  };
}
