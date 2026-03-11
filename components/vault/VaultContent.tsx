"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ctfUnlockStorageKey } from "@/config/ctf"

export default function VaultContent() {
  const [checked, setChecked] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(false)

  useEffect(() => {
    const unlocked = window.localStorage.getItem(ctfUnlockStorageKey) === "true"
    setIsUnlocked(unlocked)
    setChecked(true)
  }, [])

  return (
    <div className="w-full max-w-[45.9375rem] space-y-6">
      <header className="space-y-3">
        <p className="aman-eyebrow">ctf vault</p>
        
        {!checked && <h1 className="aman-display text-3xl sm:text-4xl text-text-primary">Checking access...</h1>}

        {checked && !isUnlocked && (
          <>
            <h1 className="aman-display text-3xl sm:text-4xl text-text-primary">Vault Locked</h1>
            <p className="text-sm text-text-muted-dark max-w-[48ch]">
              Finish the terminal challenge first. Use <code>trace</code> or <code>ctf start</code> from the homepage.
            </p>
            <Link
              href="/"
              className="inline-flex items-center rounded-md border border-border bg-surface-inner-strong px-3 py-1.5 text-xs uppercase tracking-[0.12em] text-text-secondary hover:bg-surface-hover transition-colors"
            >
              Back to terminal
            </Link>
          </>
        )}

        {checked && isUnlocked && (
          <>
            <h1 className="aman-display text-3xl sm:text-4xl text-text-primary">Vault Unlocked</h1>
            <p className="text-sm text-text-muted-dark max-w-[48ch]">
              Nice solve. You found the hidden route and cleared all 3 stages.
            </p>
          </>
        )}
      </header>

      {checked && isUnlocked && (
        <section className="swift-surface-strong rounded-lg p-6 sm:p-8 space-y-5">
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
        </section>
      )}
    </div>
  )
}
