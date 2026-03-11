import Link from "next/link"
import type { BlogPostSummary } from "@/types/blog"

interface BlogPostCardProps {
  post: BlogPostSummary
}

export default function BlogPostCard({ post }: BlogPostCardProps) {
  return (
    <article className="swift-surface rounded-lg p-5 sm:p-6 transition-transform duration-200 hover:-translate-y-0.5">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-[0.67rem] uppercase tracking-[0.14em] text-muted">
          <time dateTime={post.date}>{post.dateDisplay}</time>
          <span className="text-[#c3b39e]">•</span>
          <span>{post.readingTimeLabel}</span>
        </div>
        <h2 className="aman-display text-[1.35rem] leading-tight text-text-primary">
          <Link href={`/blog/${post.slug}`} className="hover:text-foreground transition-colors">
            {post.title}
          </Link>
        </h2>
      </header>

      <p className="mt-3 text-sm sm:text-[0.95rem] leading-relaxed text-[#514739]">{post.summary}</p>

      <footer className="mt-4 flex flex-wrap items-center gap-2">
        {post.tags.map((tag) => (
          <span key={tag} className="swift-chip normal-case tracking-normal font-medium">
            {tag}
          </span>
        ))}
      </footer>
    </article>
  )
}
