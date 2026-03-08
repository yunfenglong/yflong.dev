import { promises as fs } from "node:fs"
import path from "node:path"
import { blogConfig } from "@/config/site"
import type { BlogPost, BlogPostSummary } from "@/types/blog"

const FRONTMATTER_PATTERN = /^---\s*\n([\s\S]*?)\n---\s*\n?/
const CODE_BLOCK_TOKEN = "@@BLOG_CODE_BLOCK_"

interface BlogFrontmatter {
  title: string
  summary: string
  date: string
  tags: string[]
  published: boolean
}

const blogDirectory = path.join(process.cwd(), blogConfig.contentDirectory)

const escapeHtml = (value: string): string => {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

const stripQuotes = (value: string): string => {
  const trimmed = value.trim()

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1)
  }

  return trimmed
}

const parseTagList = (value: string): string[] => {
  const normalized = value.trim()

  if (!normalized) {
    return []
  }

  if (normalized.startsWith("[") && normalized.endsWith("]")) {
    return normalized
      .slice(1, -1)
      .split(",")
      .map((tag) => stripQuotes(tag).trim())
      .filter(Boolean)
  }

  return normalized
    .split(",")
    .map((tag) => stripQuotes(tag).trim())
    .filter(Boolean)
}

const parseFrontmatter = (
  source: string,
  slug: string,
): {
  frontmatter: BlogFrontmatter
  body: string
} => {
  const match = source.match(FRONTMATTER_PATTERN)

  if (!match) {
    throw new Error(`Blog post \"${slug}\" is missing frontmatter.`)
  }

  const frontmatterLines = match[1].split("\n")
  const fields: Record<string, string> = {}

  for (const line of frontmatterLines) {
    if (!line.trim()) {
      continue
    }

    const separatorIndex = line.indexOf(":")
    if (separatorIndex < 0) {
      continue
    }

    const key = line.slice(0, separatorIndex).trim()
    const value = line.slice(separatorIndex + 1).trim()

    if (key) {
      fields[key] = value
    }
  }

  const title = stripQuotes(fields.title || "")
  const summary = stripQuotes(fields.summary || "")
  const date = stripQuotes(fields.date || "")
  const tags = parseTagList(fields.tags || "")
  const publishedField = stripQuotes(fields.published || "true").toLowerCase()
  const published = publishedField !== "false"

  if (!title) {
    throw new Error(`Blog post \"${slug}\" is missing a title.`)
  }

  if (!summary) {
    throw new Error(`Blog post \"${slug}\" is missing a summary.`)
  }

  if (!date || Number.isNaN(new Date(date).getTime())) {
    throw new Error(`Blog post \"${slug}\" has an invalid date.`)
  }

  const body = source.slice(match[0].length).trim()

  return {
    frontmatter: {
      title,
      summary,
      date,
      tags,
      published,
    },
    body,
  }
}

const formatInlineMarkdown = (input: string): string => {
  let output = escapeHtml(input)

  output = output.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
  )
  output = output.replace(/\[([^\]]+)\]\((\/[\w\-./#?=&]+)\)/g, '<a href="$2">$1</a>')
  output = output.replace(/`([^`]+)`/g, "<code>$1</code>")
  output = output.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
  output = output.replace(/\*([^*]+)\*/g, "<em>$1</em>")

  return output
}

export const renderMarkdownToHtml = (markdown: string): string => {
  if (!markdown.trim()) {
    return ""
  }

  const normalized = markdown.replace(/\r\n/g, "\n")
  const codeBlocks: string[] = []

  const withCodePlaceholders = normalized.replace(
    /```([a-zA-Z0-9_-]+)?\n([\s\S]*?)```/g,
    (_, language: string | undefined, code: string) => {
      const languageClass = language ? ` class="language-${escapeHtml(language)}"` : ""
      const html = `<pre><code${languageClass}>${escapeHtml(code.trimEnd())}</code></pre>`
      const token = `${CODE_BLOCK_TOKEN}${codeBlocks.length}@@`
      codeBlocks.push(html)
      return token
    },
  )

  const blocks = withCodePlaceholders.split(/\n{2,}/)

  const renderBlock = (block: string): string => {
    if (block.startsWith(CODE_BLOCK_TOKEN)) {
      return block
    }

    const headingMatch = block.match(/^(#{1,3})\s+([^\n]+)(?:\n([\s\S]+))?$/)
    if (headingMatch) {
      const level = headingMatch[1].length
      const headingHtml = `<h${level}>${formatInlineMarkdown(headingMatch[2].trim())}</h${level}>`
      const remainder = headingMatch[3]?.trim()

      if (!remainder) {
        return headingHtml
      }

      return `${headingHtml}\n${renderBlock(remainder)}`
    }

    const lines = block.split("\n")

    if (lines.every((line) => /^\s*[-*]\s+/.test(line))) {
      const items = lines
        .map((line) => line.replace(/^\s*[-*]\s+/, "").trim())
        .map((item) => `<li>${formatInlineMarkdown(item)}</li>`)
        .join("")

      return `<ul>${items}</ul>`
    }

    if (lines.every((line) => /^\s*\d+\.\s+/.test(line))) {
      const items = lines
        .map((line) => line.replace(/^\s*\d+\.\s+/, "").trim())
        .map((item) => `<li>${formatInlineMarkdown(item)}</li>`)
        .join("")

      return `<ol>${items}</ol>`
    }

    if (lines.every((line) => /^>\s?/.test(line))) {
      const quoteText = lines
        .map((line) => line.replace(/^>\s?/, "").trim())
        .join(" ")

      return `<blockquote>${formatInlineMarkdown(quoteText)}</blockquote>`
    }

    const paragraph = lines.map((line) => formatInlineMarkdown(line.trim())).join("<br />")
    return `<p>${paragraph}</p>`
  }

  const htmlBlocks = blocks.map((block) => block.trim()).filter(Boolean).map(renderBlock)

  const html = htmlBlocks.join("\n")

  return html.replace(/@@BLOG_CODE_BLOCK_(\d+)@@/g, (_, index: string) => {
    const codeBlock = codeBlocks[Number(index)]
    return codeBlock || ""
  })
}

const calculateReadingTime = (content: string): number => {
  const words = content.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / blogConfig.wordsPerMinute))
}

const formatReadingTime = (minutes: number): string => {
  return `${minutes} min read`
}

export const formatBlogDate = (date: string): string => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(date))
}

const mapToBlogPost = (slug: string, source: string): BlogPost => {
  const { frontmatter, body } = parseFrontmatter(source, slug)
  const readingTimeMinutes = calculateReadingTime(body)

  return {
    slug,
    title: frontmatter.title,
    summary: frontmatter.summary,
    date: frontmatter.date,
    dateDisplay: formatBlogDate(frontmatter.date),
    tags: frontmatter.tags,
    published: frontmatter.published,
    readingTimeMinutes,
    readingTimeLabel: formatReadingTime(readingTimeMinutes),
    content: body,
    contentHtml: renderMarkdownToHtml(body),
  }
}

const sortPostsByDateDesc = (posts: BlogPost[]): BlogPost[] => {
  return [...posts].sort((left, right) => {
    return new Date(right.date).getTime() - new Date(left.date).getTime()
  })
}

const getPostFileNames = async (): Promise<string[]> => {
  try {
    const directoryEntries = await fs.readdir(blogDirectory, { withFileTypes: true })

    return directoryEntries
      .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".md"))
      .map((entry) => entry.name)
  } catch (error) {
    const err = error as NodeJS.ErrnoException
    if (err.code === "ENOENT") {
      return []
    }

    throw error
  }
}

const readAllBlogPosts = async (): Promise<BlogPost[]> => {
  const fileNames = await getPostFileNames()

  const posts = await Promise.all(
    fileNames.map(async (fileName) => {
      const slug = fileName.replace(/\.md$/i, "")
      const source = await fs.readFile(path.join(blogDirectory, fileName), "utf8")
      return mapToBlogPost(slug, source)
    }),
  )

  return sortPostsByDateDesc(posts)
}

const toSummary = (post: BlogPost): BlogPostSummary => {
  const { content, contentHtml, ...summary } = post
  void content
  void contentHtml
  return summary
}

export const getAllBlogPosts = async (): Promise<BlogPostSummary[]> => {
  const posts = await readAllBlogPosts()
  return posts.map(toSummary)
}

export const getPublishedBlogPosts = async (): Promise<BlogPostSummary[]> => {
  const posts = await getAllBlogPosts()
  return posts.filter((post) => post.published)
}

export const getPublishedBlogPostBySlug = async (
  slug: string,
): Promise<BlogPost | null> => {
  const posts = await readAllBlogPosts()
  const post = posts.find((entry) => entry.slug === slug && entry.published)

  return post ?? null
}

export const getPublishedBlogSlugs = async (): Promise<string[]> => {
  const posts = await getPublishedBlogPosts()
  return posts.map((post) => post.slug)
}

export const getBlogTagCounts = (
  posts: BlogPostSummary[],
): Array<{ tag: string; count: number }> => {
  const tagMap = new Map<string, number>()

  posts.forEach((post) => {
    post.tags.forEach((tag) => {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1)
    })
  })

  return Array.from(tagMap.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((left, right) => {
      if (right.count === left.count) {
        return left.tag.localeCompare(right.tag)
      }
      return right.count - left.count
    })
}

export type { BlogPost, BlogPostSummary }
