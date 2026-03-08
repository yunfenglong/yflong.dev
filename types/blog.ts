export interface BlogPostSummary {
  slug: string
  title: string
  summary: string
  date: string
  dateDisplay: string
  tags: string[]
  published: boolean
  readingTimeMinutes: number
  readingTimeLabel: string
}

export interface BlogPost extends BlogPostSummary {
  content: string
  contentHtml: string
}
