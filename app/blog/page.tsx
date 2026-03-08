import type { Metadata } from "next"
import SiteNavigation from "@/components/layout/SiteNavigation"
import SiteFooter from "@/components/layout/SiteFooter"
import BlogPostCard from "@/components/blog/BlogPostCard"
import { getBlogTagCounts, getPublishedBlogPosts } from "@/lib/blog"
import { siteConfig } from "@/config/site"

export const metadata: Metadata = {
  title: "Blog",
  description: "Engineering notes, build logs, and technical writeups by Yunfeng Long.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Blog | YFLONG.DEV",
    description: "Engineering notes, build logs, and technical writeups by Yunfeng Long.",
    url: `${siteConfig.url}/blog`,
    siteName: siteConfig.name,
    type: "website",
  },
}

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts()
  const tagCounts = getBlogTagCounts(posts).slice(0, 8)

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteNavigation />
      <main className="flex-1 px-[5%] pt-[calc(env(safe-area-inset-top)+8rem)] pb-[7dvh] flex items-start justify-center">
        <section className="w-full max-w-[61.25rem] space-y-6 sm:space-y-8">
          <header className="swift-surface-strong rounded-lg p-6 sm:p-8 space-y-3">
            <p className="text-[0.6875rem] uppercase tracking-[0.14em] text-[#8f8475]">blog</p>
            <h1 className="aman-display text-[1.9rem] sm:text-[2.3rem] leading-none text-[#3b342c]">
              Field Notes
            </h1>
            <p className="max-w-[44rem] text-sm sm:text-[0.95rem] leading-relaxed text-[#554b3e]">
              Build decisions, reliability notes, and practical implementation details from work in
              progress.
            </p>

            {tagCounts.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {tagCounts.map((entry) => (
                  <span key={entry.tag} className="swift-chip normal-case tracking-normal font-medium">
                    {entry.tag} · {entry.count}
                  </span>
                ))}
              </div>
            )}
          </header>

          {posts.length === 0 ? (
            <article className="swift-surface rounded-lg p-6">
              <p className="text-sm text-[#5f5446]">No posts published yet.</p>
            </article>
          ) : (
            <div className="grid gap-4 sm:gap-5">
              {posts.map((post) => (
                <BlogPostCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
