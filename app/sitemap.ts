import type { MetadataRoute } from "next"
import { getPublishedBlogPosts } from "@/lib/blog"
import { siteConfig } from "@/config/site"
import { algorithmCatalog } from "@/config/algorithms"

export const dynamic = "force-static"

const staticRoutes = [
  "",
  "/blog",
  "/alg",
  "/project",
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

  const algorithmEntries: MetadataRoute.Sitemap = algorithmCatalog.map((algorithm) => ({
    url: `${siteConfig.url}/alg/${algorithm.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.65,
  }))

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteConfig.url}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }))

  return [...routeEntries, ...algorithmEntries, ...postEntries]
}
