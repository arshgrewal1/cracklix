
/**
 * @fileOverview Neutralized dynamic manifest to satisfy static export requirements.
 * The active manifest is located at public/manifest.json.
 */

export const dynamic = 'force-static';

export default function manifest() {
  return {
    name: "Cracklix | Punjab's Smart Mock Test Platform",
    short_name: "Cracklix",
    description: "Punjab's most trusted government exam preparation platform.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1677FF",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
