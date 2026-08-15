import { MetadataRoute } from 'next';

/**
 * @fileOverview Official PWA Manifest Registry v2.7.
 * UPDATED: Optimized icon registry with comprehensive sizes for blue logo assets.
 */

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cracklix | Punjab's Smart Mock Test Platform",
    short_name: "Cracklix",
    description: "Punjab's most trusted government exam preparation platform.",
    start_url: "/",
    display: "standalone",
    display_override: ["standalone"],
    orientation: "portrait",
    background_color: "#05070B",
    theme_color: "#05070B",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icons/icon-384x384.png",
        sizes: "384x384",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable"
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
