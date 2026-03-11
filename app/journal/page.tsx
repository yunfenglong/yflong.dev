import { promises as fs } from "node:fs"
import path from "node:path"
import type { Metadata } from "next"
import SiteNavigation from "@/components/layout/SiteNavigation"
import SiteFooter from "@/components/layout/SiteFooter"
import { siteConfig } from "@/config/site"
import { renderMarkdownToHtml } from "@/lib/blog"

const changelogPath = path.join(process.cwd(), "CHANGELOG.md")

const formatUpdatedDate = (value: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
  }).format(value)
}

const stripChangelogPreamble = (source: string): string => {
  return source
    .replace(/^#\s+Changelog\s*\n+/i, "")
    .replace(/^All notable[^\n]*\n+/i, "")
    .trim()
}

const getJournalContent = async (): Promise<{
  contentHtml: string
  hasEntries: boolean
  updatedAtLabel: string
}> => {
  try {
    const [source, stats] = await Promise.all([
      fs.readFile(changelogPath, "utf8"),
      fs.stat(changelogPath),
    ])

    const normalizedSource = stripChangelogPreamble(source)

    return {
      contentHtml: renderMarkdownToHtml(normalizedSource),
      hasEntries: Boolean(normalizedSource),
      updatedAtLabel: formatUpdatedDate(stats.mtime),
    }
  } catch {
    return {
      contentHtml: "",
      hasEntries: false,
      updatedAtLabel: "Unavailable",
    }
  }
}

export const metadata: Metadata = {
  title: "Journal",
  description: "Release notes and build logs pulled from the project changelog.",
  alternates: {
    canonical: "/journal",
  },
  openGraph: {
    title: "Journal | YFLONG.DEV",
    description: "Release notes and build logs pulled from the project changelog.",
    url: `${siteConfig.url}/journal`,
    siteName: siteConfig.name,
    type: "website",
  },
}

export const dynamic = "force-static"

export default async function JournalPage() {
  const journal = await getJournalContent()

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteNavigation />
      <main className="flex-1 px-[5%] pt-[calc(env(safe-area-inset-top)+8rem)] pb-[7dvh] flex items-start justify-center">
        <article className="w-full max-w-[45.9375rem] space-y-5 sm:space-y-6">
          <header className="space-y-3">
            <p className="aman-eyebrow">journal</p>
            <h1 className="aman-display text-3xl sm:text-4xl text-text-primary">
              Build Journal
            </h1>
            <p className="text-sm text-text-muted-dark leading-relaxed max-w-[48ch]">
              Release notes and project updates synced from <code>CHANGELOG.md</code>.
            </p>
            <p className="text-[0.67rem] uppercase tracking-[0.14em] text-muted">
              Last updated: {journal.updatedAtLabel}
            </p>
          </header>

          <section className="swift-surface rounded-lg p-6 sm:p-8">
            {journal.hasEntries ? (
              <div
                className="blog-content text-[0.97rem] leading-relaxed text-text-secondary"
                dangerouslySetInnerHTML={{ __html: journal.contentHtml }}
              />
            ) : (
              <p className="text-sm text-text-muted-dark">No journal entries available yet.</p>
            )}
          </section>
        </article>
      </main>
      <SiteFooter />
    </div>
  )
}
