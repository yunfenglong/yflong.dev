"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import SiteNavigation from "@/components/layout/SiteNavigation"
import SiteFooter from "@/components/layout/SiteFooter"
import { ctfUnlockStorageKey } from "@/config/ctf"

export default function VaultPage() {
  const [checked, setChecked] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(false)

  useEffect(() => {
    const unlocked = window.localStorage.getItem(ctfUnlockStorageKey) === "true"
    setIsUnlocked(unlocked)
    setChecked(true)
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteNavigation />
      <main className="flex-1 px-[5%] pt-[calc(env(safe-area-inset-top)+8rem)] pb-[7dvh] flex items-start justify-center">
        <section className="w-full max-w-[45.9375rem] swift-surface-strong rounded-lg p-6 sm:p-8 space-y-5">
          <p className="text-[0.6875rem] uppercase tracking-[0.14em] text-muted">ctf vault</p>

          {!checked && <p className="text-text-muted-dark text-sm">Checking access...</p>}

          {checked && !isUnlocked && (
            <div className="space-y-3">
              <h1 className="aman-display text-[1.5rem] leading-none text-text-primary">Vault Locked</h1>
              <p className="text-sm text-text-muted-dark">
                Finish the terminal challenge first. Use <code>trace</code> or <code>ctf start</code> from the homepage.
              </p>
              <Link
                href="/"
                className="inline-flex items-center rounded-md border border-border bg-surface-inner-strong px-3 py-1.5 text-xs uppercase tracking-[0.12em] text-text-secondary hover:bg-surface-hover transition-colors"
              >
                Back to terminal
              </Link>
            </div>
          )}

          {checked && isUnlocked && (
            <div className="space-y-4">
              <h1 className="aman-display text-[1.75rem] leading-none text-text-primary">Vault Unlocked</h1>
              <p className="text-sm text-text-muted-dark">
                Nice solve. You found the hidden route and cleared all 3 stages.
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                <article className="rounded-md border border-border bg-[#f7f2e9] p-3">
                  <p className="text-[0.625rem] uppercase tracking-[0.16em] text-muted">artifact 01</p>
                  <p className="mt-1 text-sm text-text-secondary">The best projects usually start as broken prototypes.</p>
                </article>
                <article className="rounded-md border border-border bg-[#f7f2e9] p-3">
                  <p className="text-[0.625rem] uppercase tracking-[0.16em] text-muted">artifact 02</p>
                  <p className="mt-1 text-sm text-text-secondary">Your route-recovery badge is now permanent on this browser.</p>
                </article>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <Link
                  href="/"
                  className="inline-flex items-center rounded-md border border-border bg-surface-inner-strong px-3 py-1.5 text-xs uppercase tracking-[0.12em] text-text-secondary hover:bg-surface-hover transition-colors"
                >
                  Back to terminal
                </Link>
                <Link
                  href="/status"
                  className="inline-flex items-center rounded-md border border-border bg-surface-inner-strong px-3 py-1.5 text-xs uppercase tracking-[0.12em] text-text-secondary hover:bg-surface-hover transition-colors"
                >
                  Open status
                </Link>
              </div>
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
