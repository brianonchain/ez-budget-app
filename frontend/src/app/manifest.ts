import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EZ Budget App",
    short_name: "EZ Budget",
    description: "Track your expenses with fewer clicks",
    display: "standalone",
    start_url: "/app/items",
    scope: "/",
    id: "/",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
