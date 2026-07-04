
import { MetadataRoute } from 'next';

/**
 * @fileOverview Official PWA Manifest Registry v2.0.
 * Optimized for high-fidelity Android splash screens and home screen icons.
 */

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cracklix | Punjab's Mock Test Platform",
    short_name: "Cracklix",
    description: "Punjab's most trusted government exam preparation platform.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0B1528",
    theme_color: "#2563EB",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      },
      {
        src: "/icons/icon-maskable-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable"
      },
      {
        src: "/icons/icon-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ],
    shortcuts: [
      {
        name: "My Exams",
        url: "/my-exams",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }]
      },
      {
        name: "Mock Tests",
        url: "/mocks",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }]
      }
    ]
  };
}
