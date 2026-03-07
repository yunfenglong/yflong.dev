"use client"

import { useState } from "react"
import Link from "next/link"
import SiteNavigation from "@/components/layout/SiteNavigation"

interface FixOption {
  id: string
  title: string
  patch: string
  isCorrect: boolean
}

const fixOptions: FixOption[] = [
  {
    id: "typo-route",
    title: "Fix route typo in navigation",
    patch: "replace('/stauts', '/status')",
    isCorrect: true,
  },
  {
    id: "suppress-error",
    title: "Ignore all route errors",
    patch: "onError(() => null)",
    isCorrect: false,
  },
  {
    id: "force-redirect",
    title: "Redirect every 404 to /",
    patch: "if (status === 404) return redirect('/')",
    isCorrect: false,
  },
]

const stackTrace = `Error: RouteResolutionError
at resolvePath (router.ts:91:13)
at navigate (router.ts:151:21)
at Link.onClick (SiteNavigation.tsx:68:9)

Requested path: /stauts
Expected path:  /status`

export default function NotFound() {
  const [attemptsLeft, setAttemptsLeft] = useState(2)
  const [resolved, setResolved] = useState(false)
  const [feedback, setFeedback] = useState("Pick the safest patch to recover the route.")
  const [showHint, setShowHint] = useState(false)

  const selectPatch = (option: FixOption) => {
    if (resolved || attemptsLeft <= 0) {
      return
    }

    if (option.isCorrect) {
      setResolved(true)
      setFeedback("Route recovered. Navigation map is stable again.")
      return
    }

    const nextAttempts = attemptsLeft - 1
    setAttemptsLeft(nextAttempts)
    if (nextAttempts <= 0) {
      setFeedback("All retries used. Correct fix was the route typo patch.")
      return
    }

    setFeedback(`Patch failed. ${nextAttempts} attempt${nextAttempts === 1 ? "" : "s"} left.`)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNavigation page="home" />
      <main className="min-h-screen px-[5%] pt-[calc(env(safe-area-inset-top)+8rem)] pb-[7dvh] flex items-start justify-center">
        <section className="w-full max-w-[45.9375rem] swift-surface-strong rounded-lg p-5 sm:p-7 space-y-5">
          <header className="space-y-2">
            <p className="text-[0.6875rem] uppercase tracking-[0.14em] text-[#8f8475]">404 debug mission</p>
            <h1 className="aman-display text-[1.6rem] leading-none text-[#3b342c]">
              Route Not Found
            </h1>
            <p className="text-sm text-[#5f5446]">
              Recover this route by selecting the best patch. Permanent hacks do not count.
            </p>
          </header>

          <pre className="rounded-md border border-[#d7ccbc] bg-[#f7f2e9] p-3 text-[0.75rem] leading-relaxed text-[#4f4538] overflow-x-auto whitespace-pre-wrap">
            {stackTrace}
          </pre>

          <div className="space-y-2">
            {fixOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                disabled={resolved || attemptsLeft <= 0}
                onClick={() => selectPatch(option)}
                className="w-full text-left rounded-md border border-[#d7ccbc] bg-[#f6f1e8] p-3 hover:bg-[#eee5d7] disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              >
                <p className="text-xs uppercase tracking-[0.12em] text-[#8f8475]">{option.title}</p>
                <p className="font-mono text-[0.78rem] text-[#4f4538] mt-1">{option.patch}</p>
              </button>
            ))}
          </div>

          <p
            className={`text-sm ${
              resolved ? "text-[#607758]" : attemptsLeft <= 0 ? "text-[#914840]" : "text-[#5f5446]"
            }`}
          >
            {feedback}
          </p>

          {resolved && (
            <div className="space-y-3">
              <Link
                href="/"
                className="inline-flex items-center rounded-md border border-[#d7ccbc] bg-[#f6f1e8] px-3 py-1.5 text-xs uppercase tracking-[0.12em] text-[#4f4538] hover:bg-[#eee5d7] transition-colors"
              >
                Recovered route
              </Link>

              <div>
                <button
                  type="button"
                  onClick={() => setShowHint((current) => !current)}
                  className="text-xs uppercase tracking-[0.12em] text-[#8a7451] hover:text-[#6e593a] transition-colors"
                >
                  {showHint ? "Hide incident log" : "Show incident log"}
                </button>
                {showHint && (
                  <p className="mt-2 rounded-md border border-[#d7ccbc] bg-[#f7f2e9] p-3 text-sm text-[#4f4538]">
                    incident.log: if you are doing the CTF, inspect the homepage <code>{`<main>`}</code> attributes.
                  </p>
                )}
              </div>
            </div>
          )}

          {!resolved && attemptsLeft <= 0 && (
            <Link
              href="/"
              className="inline-flex items-center rounded-md border border-[#d7ccbc] bg-[#f6f1e8] px-3 py-1.5 text-xs uppercase tracking-[0.12em] text-[#4f4538] hover:bg-[#eee5d7] transition-colors"
            >
              Return home
            </Link>
          )}
        </section>
      </main>
    </div>
  )
}
