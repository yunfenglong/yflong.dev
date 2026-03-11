export interface ContactMethod {
  id: string
  label: string
  value: string
  href: string
}

export interface ProjectLink {
  label: string
  href: string
  external: boolean
}

export interface ProjectCaseStudy {
  id: string
  title: string
  status: "production" | "beta" | "maintenance"
  summary: string
  problem: string
  architecture: string[]
  outcomes: string[]
  techStack: string[]
  links: ProjectLink[]
}

export interface ProfileConfig {
  name: string
  headline: string
  elevatorPitch: string
  university: string
  targetRole: string
  location: string
  timezone: string
  email: string
  linkedin: string
  github: string
}
