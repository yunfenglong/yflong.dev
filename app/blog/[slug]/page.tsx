import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import SiteNavigation from "@/components/layout/SiteNavigation"
import SiteFooter from "@/components/layout/SiteFooter"
import {
  getPublishedBlogPostBySlug,
  getPublishedBlogPosts,
  getPublishedBlogSlugs,
} from "@/lib/blog"
import { siteConfig } from "@/config/site"

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export const dynamicParams = false

export async function generateStaticParams() {
  const slugs = await getPublishedBlogSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPublishedBlogPostBySlug(slug)

  if (!post) {
    return {
      title: "Post Not Found",
    }
  }

  return {
    title: post.title,
    description: post.summary,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: `${post.title} | ${siteConfig.name}`,
      description: post.summary,
      type: "article",
      url: `${siteConfig.url}/blog/${post.slug}`,
      publishedTime: new Date(post.date).toISOString(),
      siteName: siteConfig.name,
      tags: post.tags,
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getPublishedBlogPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const posts = await getPublishedBlogPosts()
  const index = posts.findIndex((entry) => entry.slug === post.slug)
  const newerPost = index > 0 ? posts[index - 1] : null
  const olderPost = index < posts.length - 1 ? posts[index + 1] : null

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteNavigation />
      <main className="flex-1 px-[5%] pt-[calc(env(safe-area-inset-top)+8rem)] pb-[7dvh] flex items-start justify-center">
        <article className="w-full max-w-[45.9375rem] space-y-5 sm:space-y-6">
          <header className="swift-surface-strong rounded-lg p-6 sm:p-8 space-y-3">
            <Link
              href="/blog"
              className="inline-flex text-[0.6875rem] uppercase tracking-[0.14em] text-[#8f8475] hover:text-[#5f5446] transition-colors"
            >
              ← back to blog
            </Link>

            <h1 className="aman-display text-[1.8rem] sm:text-[2.25rem] leading-none text-[#3b342c]">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-2 text-[0.67rem] uppercase tracking-[0.14em] text-[#8f8475]">
              <time dateTime={post.date}>{post.dateDisplay}</time>
              <span className="text-[#c3b39e]">•</span>
              <span>{post.readingTimeLabel}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="swift-chip normal-case tracking-normal font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </header>

          <section className="swift-surface rounded-lg p-6 sm:p-8">
            <div
              className="blog-content text-[0.97rem] leading-relaxed text-[#4f4538]"
              dangerouslySetInnerHTML={{ __html: post.contentHtml }}
            />
          </section>

          <nav className="grid gap-3 sm:grid-cols-2" aria-label="Post navigation">
            <div className="swift-surface rounded-lg p-4 min-h-[7.5rem]">
              {newerPost ? (
                <div className="space-y-2">
                  <p className="text-[0.65rem] uppercase tracking-[0.14em] text-[#8f8475]">newer</p>
                  <Link
                    href={`/blog/${newerPost.slug}`}
                    className="aman-display text-[1.1rem] leading-tight text-[#3b342c] hover:text-[#2f2a24] transition-colors"
                  >
                    {newerPost.title}
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-[#8f8475]">No newer post</p>
              )}
            </div>

            <div className="swift-surface rounded-lg p-4 min-h-[7.5rem]">
              {olderPost ? (
                <div className="space-y-2">
                  <p className="text-[0.65rem] uppercase tracking-[0.14em] text-[#8f8475]">older</p>
                  <Link
                    href={`/blog/${olderPost.slug}`}
                    className="aman-display text-[1.1rem] leading-tight text-[#3b342c] hover:text-[#2f2a24] transition-colors"
                  >
                    {olderPost.title}
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-[#8f8475]">No older post</p>
              )}
            </div>
          </nav>
        </article>
      </main>
      <SiteFooter />
    </div>
  )
}
