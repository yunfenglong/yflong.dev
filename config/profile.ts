import type { ContactMethod, ProfileConfig, ProjectCaseStudy } from "@/types/profile"

export const profileConfig: ProfileConfig = {
  name: "Yunfeng Long",
  headline: "CS student building production-minded web systems.",
  elevatorPitch:
    "Third-year CS student focused on frontend engineering, reliability, and practical automation.",
  university: "Monash University",
  targetRole: "Frontend Engineer and Test Engineer",
  location: "Greater Kuala Lumpur, Malaysia",
  timezone: "UTC+08:00",
  email: "teur@yflong.dev",
  linkedin: "https://www.linkedin.com/in/yunfeng-l/",
  github: "https://github.com/yunfenglong",
}

export const contactMethods: ContactMethod[] = [
  {
    id: "email",
    label: "Email",
    value: profileConfig.email,
    href: `mailto:${profileConfig.email}`,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    value: "linkedin.com/in/yunfeng-l",
    href: profileConfig.linkedin,
  },
  {
    id: "github",
    label: "GitHub",
    value: "github.com/yunfenglong",
    href: profileConfig.github,
  },
]

export const projectCaseStudies: ProjectCaseStudy[] = [
  {
    id: "terminal-portfolio",
    title: "yflong.dev Terminal Portfolio",
    status: "production",
    summary:
      "Terminal-first portfolio with command-driven interaction, embedded CTF mode, and content routes.",
    problem:
      "Typical portfolio sites are visually polished but do not demonstrate interactive system thinking.",
    architecture: [
      "Command engine separated from rendering via typed command handlers and runtime context interfaces.",
      "State management in custom hooks for terminal history, boot sequence, and keyboard interaction.",
      "Static blog pipeline with frontmatter validation and markdown-to-HTML rendering.",
    ],
    outcomes: [
      "Delivered a unique interface that directly demonstrates product and engineering personality.",
      "Added first-party blog and journal routes to keep all content in one deployable surface.",
      "Built reusable UI tokens and page shells to maintain visual and codebase consistency.",
    ],
    techStack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Framer Motion"],
    links: [
      { label: "Live Site", href: "https://yflong.dev", external: true },
      {
        label: "Source Code",
        href: "https://github.com/yunfenglong/yflong.dev",
        external: true,
      },
      { label: "Status Page", href: "/status", external: false },
    ],
  },
  {
    id: "wans-dine",
    title: "Wan's Dine",
    status: "maintenance",
    summary:
      "Restaurant discovery platform with location-based browsing and service health instrumentation.",
    problem:
      "Users need faster restaurant shortlisting without navigating multiple disconnected food platforms.",
    architecture: [
      "Frontend client optimized for fast listing queries and category filtering.",
      "Service health and incident traces integrated into the same portfolio ecosystem for transparency.",
      "Modular feature grouping to isolate recommendation logic, route handlers, and UI concerns.",
    ],
    outcomes: [
      "Shipped a full product surface with discoverability, filtering, and operational visibility.",
      "Documented outage handling and active incident communication through the status dashboard model.",
      "Established a platform to discuss reliability and recovery strategy during interviews.",
    ],
    techStack: ["TypeScript", "React", "Next.js", "API Integration", "Observability"],
    links: [
      { label: "Service Endpoint", href: "https://dine.yflong.dev", external: true },
      { label: "Status Signal", href: "/status", external: false },
    ],
  },
  {
    id: "been-there-series",
    title: "Been There Series",
    status: "production",
    summary: "Travel exploration app for curated luxury hotel discovery and trip planning workflows.",
    problem:
      "Travel research for premium stays is fragmented across content-heavy portals and repetitive comparisons.",
    architecture: [
      "Feature-focused frontend architecture with reusable search and detail modules.",
      "External service abstraction for destination and stay metadata retrieval.",
      "Progressive rendering strategy to keep route transitions responsive across devices.",
    ],
    outcomes: [
      "Published a polished project that demonstrates product UX, data handling, and deployment workflow.",
      "Created a second domain project to show breadth beyond portfolio and blog infrastructure.",
      "Added a practical discussion point for frontend architecture and API tradeoffs.",
    ],
    techStack: ["Next.js", "TypeScript", "Frontend Architecture", "API Design"],
    links: [
      { label: "Live Service", href: "https://travel.yflong.dev", external: true },
      { label: "Portfolio Contact", href: "/contact", external: false },
    ],
  },
]
