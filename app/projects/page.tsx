import type { Metadata } from "next"
import Link from "next/link"
import SiteNavigation from "@/components/layout/SiteNavigation"
import SiteFooter from "@/components/layout/SiteFooter"
import { profileConfig, projectCaseStudies } from "@/config/profile"
import { siteConfig } from "@/config/site"

const statusClassName: Record<(typeof projectCaseStudies)[number]["status"], string> = {
  production: "bg-[#eef2ea] border-[#c9d4c1] text-[#607758]",
  beta: "bg-[#f5ecdf] border-[#e4d3bb] text-[#9b7441]",
  maintenance: "bg-[#f2e5e3] border-[#d9bdb9] text-[#914840]",
}

export const metadata: Metadata = {
  title: "Projects",
  description: "Case-study breakdown of software projects by Yunfeng Long.",
  alternates: {
    canonical: "/projects",
  },
  openGraph: {
    title: "Projects | YFLONG.DEV",
    description: "Case-study breakdown of software projects by Yunfeng Long.",
    url: `${siteConfig.url}/projects`,
    siteName: siteConfig.name,
    type: "website",
  },
}

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteNavigation />
      <main className="flex-1 px-[5%] pt-[calc(env(safe-area-inset-top)+8rem)] pb-[7dvh] flex items-start justify-center">
        <section className="w-full max-w-[61.25rem] space-y-5 sm:space-y-6">
          <header className="swift-surface-strong rounded-lg p-6 sm:p-8 space-y-3">
            <p className="text-[0.6875rem] uppercase tracking-[0.14em] text-[#8f8475]">projects</p>
            <h1 className="aman-display text-[1.9rem] sm:text-[2.25rem] leading-none text-[#3b342c]">
              Engineering Case Studies
            </h1>
            <p className="w-full text-sm sm:text-[0.95rem] leading-relaxed text-[#554b3e]">
              Standard case-study format: problem, architecture, outcomes, and implementation
              tradeoffs. Built to support interviews and technical discussions.
            </p>
            <p className="text-[0.7rem] uppercase tracking-[0.14em] text-[#8f8475]">
              Target role: {profileConfig.targetRole}
            </p>
          </header>

          <div className="grid gap-4 sm:gap-5">
            {projectCaseStudies.map((project) => (
              <article key={project.id} className="swift-surface rounded-lg p-5 sm:p-6 space-y-5">
                <header className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="aman-display text-[1.35rem] sm:text-[1.55rem] leading-tight text-[#3b342c]">
                      {project.title}
                    </h2>
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[0.62rem] uppercase tracking-[0.12em] ${statusClassName[project.status]}`}
                    >
                      {project.status}
                    </span>
                  </div>
                  <p className="text-sm text-[#5f5446] leading-relaxed">{project.summary}</p>
                </header>

                <section className="space-y-1.5">
                  <h3 className="text-[0.68rem] uppercase tracking-[0.14em] text-[#8f8475]">problem</h3>
                  <p className="text-sm text-[#4f4538] leading-relaxed">{project.problem}</p>
                </section>

                <section className="space-y-2">
                  <h3 className="text-[0.68rem] uppercase tracking-[0.14em] text-[#8f8475]">
                    architecture
                  </h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-[#4f4538] leading-relaxed">
                    {project.architecture.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>

                <section className="space-y-2">
                  <h3 className="text-[0.68rem] uppercase tracking-[0.14em] text-[#8f8475]">
                    outcomes
                  </h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-[#4f4538] leading-relaxed">
                    {project.outcomes.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>

                <section className="space-y-2">
                  <h3 className="text-[0.68rem] uppercase tracking-[0.14em] text-[#8f8475]">
                    stack
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.map((item) => (
                      <span key={item} className="swift-chip normal-case tracking-normal font-medium">
                        {item}
                      </span>
                    ))}
                  </div>
                </section>

                <footer className="flex flex-wrap gap-2 pt-1">
                  {project.links.map((link) => {
                    const className =
                      "inline-flex items-center rounded-md border border-[#d7ccbc] bg-[#f6f1e8] px-3 py-1.5 text-[0.66rem] uppercase tracking-[0.12em] text-[#4f4538] hover:bg-[#eee5d7] transition-colors"

                    if (link.external) {
                      return (
                        <a
                          key={link.href}
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={className}
                        >
                          {link.label}
                        </a>
                      )
                    }

                    return (
                      <Link key={link.href} href={link.href} className={className}>
                        {link.label}
                      </Link>
                    )
                  })}
                </footer>
              </article>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
