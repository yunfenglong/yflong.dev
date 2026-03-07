"use client"

import Link from "next/link"

interface SiteNavigationProps {
  page: "home" | "status"
}

const externalLinks = [
  {
    label: "changelogs",
    href: "https://github.com/yunfenglong/yflong.dev/blob/main/CHANGELOG.md",
  },
  { label: "blogs", href: "https://blog.yflong.dev" },
  { label: "dines", href: "https://dine.yflong.dev" },
]

function GithubIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="opacity-80 hover:opacity-100 transition-opacity"
      aria-hidden="true"
    >
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  )
}

function DesktopLinks({ page }: SiteNavigationProps) {
  return (
    <div className="hidden sm:flex items-center space-x-8 font-mono text-sm text-white/80">
      {page === "status" && (
        <Link href="/status" className="text-white">
          status
        </Link>
      )}
      {externalLinks.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className="hover:text-white transition-colors"
        >
          {link.label}
        </a>
      ))}
      <a
        href="https://github.com/yunfenglong/yflong.dev"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-white transition-colors"
      >
        <GithubIcon />
      </a>
    </div>
  )
}

export default function SiteNavigation({ page }: SiteNavigationProps) {
  if (page === "home") {
    return (
      <div className="fixed inset-0 z-30 pointer-events-none">
        <nav
          aria-label="global navigation"
          className="absolute top-0 left-0 right-0 z-10 pointer-events-auto"
        >
          <div className="flex justify-end items-center px-8 py-6">
            <DesktopLinks page={page} />
          </div>
        </nav>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-30 pointer-events-none">
      <nav
        aria-label="global navigation"
        className="absolute top-0 left-0 right-0 z-10 pointer-events-auto"
      >
        <div className="flex justify-between items-center px-4 sm:px-8 py-6">
          <div className="flex items-center space-x-4" />
          <DesktopLinks page={page} />
          <div className="sm:hidden">
            <Link href="/" className="text-white/80 hover:text-white transition-colors">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M3 12h18m-9-9l9 9-9 9" />
              </svg>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  )
}
