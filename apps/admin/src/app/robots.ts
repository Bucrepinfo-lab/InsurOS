import type { MetadataRoute } from "next";

const SITE = "https://getinsuros.com";

/** Google may read the public pages; the agency workspace and APIs stay out of search (owner 26/11/26). */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/why", "/contact", "/terms", "/privacy", "/delete-account", "/join"],
        disallow: ["/api/", "/dashboard", "/account", "/my", "/c/", "/set-pin", "/access-pending"],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
