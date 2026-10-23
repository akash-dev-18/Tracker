import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Docket — Study & Career Register",
    short_name: "Docket",
    description: "A private register for DSA practice, job applications, and projects.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#090a0b",
    theme_color: "#090a0b",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
