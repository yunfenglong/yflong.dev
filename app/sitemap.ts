import type { MetadataRoute } from "next"
import { getPublishedBlogPosts } from "@/lib/blog"
import { siteConfig } from "@/config/site"

export const dynamic = "force-static"

const staticRoutes = [
  "",
  "/blog",
  "/alg",
  "/projects",
  "/contact",
  "/journal",
  "/status",
  "/privacy",
  "/vault",
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublishedBlogPosts()

  const routeEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.6,
  }))

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteConfig.url}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }))

  return [...routeEntries, ...postEntries]
}
