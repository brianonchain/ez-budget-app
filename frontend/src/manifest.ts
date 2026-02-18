import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EZ Budget App",
    short_name: "EZ Budget",
    start_url: "https://www.ezbudgetapp.com/app/items",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      {
        src: "/public/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/public/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
