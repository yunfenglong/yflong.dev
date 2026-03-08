"use client"

import Link from "next/link"
import localFont from "next/font/local"
import { useEffect, useRef, useState } from "react"
import { profileConfig } from "@/config/profile"

const shadowsIntoLight = localFont({
  src: "../../lib/ShadowsIntoLight-Regular.ttf",
  display: "swap",
  weight: "400",
  style: "normal",
})

const internalLinks = [
  { label: "blog", href: "/blog" },
  { label: "projects", href: "/projects" },
  { label: "journal", href: "/journal" },
]

const githubRepoUrl = profileConfig.github

function GithubIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="opacity-75 hover:opacity-100 transition-opacity"
      aria-hidden="true"
    >
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  )
}

function DesktopLinks() {
  return (
    <div className="hidden sm:flex items-center gap-6 text-[0.6875rem] font-medium text-[#5f5446]">
      {internalLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="swift-pill hover:text-[#2f2a24] transition-colors"
        >
          {link.label}
        </Link>
      ))}
      <a
        href={githubRepoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="swift-pill hover:text-[#2f2a24] transition-colors"
        aria-label="GitHub"
      >
        <GithubIcon />
      </a>
    </div>
  )
}

function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    window.addEventListener("pointerdown", handlePointerDown)
    return () => window.removeEventListener("pointerdown", handlePointerDown)
  }, [isOpen])

  return (
    <div ref={menuRef} className="relative sm:hidden">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="mobile-navigation-menu"
        onClick={() => setIsOpen((open) => !open)}
        className="swift-pill inline-flex items-center gap-2 text-[0.6875rem] font-medium text-[#5f5446] hover:text-[#2f2a24] transition-colors"
      >
        menu
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path d="M1.5 3.5 5 7l3.5-3.5" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </button>

      {isOpen ? (
        <div
          id="mobile-navigation-menu"
          className="absolute right-0 top-[calc(100%+0.6rem)] min-w-[10rem] rounded-md border border-[#d2c4b1] bg-[#f8f4ec] px-4 py-3 shadow-[0_1rem_2rem_-1rem_rgba(30,24,17,0.45)]"
        >
          <div className="flex flex-col items-start gap-3 text-[0.6875rem] font-medium text-[#5f5446]">
            {internalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="swift-pill hover:text-[#2f2a24] transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <a
              href={githubRepoUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="swift-pill inline-flex items-center gap-2 whitespace-nowrap hover:text-[#2f2a24] transition-colors"
            >
              github 
              <GithubIcon />
            </a>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default function SiteNavigation() {
  return (
    <div className="fixed inset-x-0 top-0 z-30 pointer-events-none">
      <nav
        data-layout-header
        aria-label="global navigation"
        className="pointer-events-auto w-full px-[5%] pt-[calc(env(safe-area-inset-top)+1rem)]"
      >
        <div className="w-full max-w-[61.25rem] mx-auto">
          <div className="swift-nav flex items-center justify-between pb-3">
            <Link
              href="/"
              className={`${shadowsIntoLight.className} text-lg text-[#3b342c] tracking-[0.08em]`}
            >
              wAn
            </Link>

            <DesktopLinks />

            <MobileMenu />
          </div>
        </div>
      </nav>
    </div>
  )
}
