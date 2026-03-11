"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useEffect, useRef, useState } from "react"

type IntroFrame = {
  from: {
    top: number
    left: number
    width: number
    height: number
    borderRadius: number
  }
  to: {
    top: number
    left: number
    width: number
    height: number
    borderRadius: number
  }
}

function createViewportFrame() {
  return {
    top: 12,
    left: 12,
    width: window.innerWidth - 24,
    height: window.innerHeight - 24,
    borderRadius: 34,
  }
}

function createTargetFrame(iconRect: DOMRect) {
  return {
    top: iconRect.top - 1,
    left: iconRect.left - 1,
    width: iconRect.width + 2,
    height: iconRect.height + 2,
    borderRadius: (iconRect.width + 2) / 2,
  }
}

export default function AlgorithmMobileTips() {
  const iconShellRef = useRef<HTMLDivElement | null>(null)
  const shouldReduceMotion = useReducedMotion()
  const [introFrame, setIntroFrame] = useState<IntroFrame | null>(null)
  const [showIntro, setShowIntro] = useState(false)
  const [enableLoopRotation, setEnableLoopRotation] = useState(false)

  useEffect(() => {
    if (shouldReduceMotion) {
      setEnableLoopRotation(true)
      return
    }

    const mediaQuery = window.matchMedia("(max-width: 639px)")

    if (!mediaQuery.matches) {
      setEnableLoopRotation(true)
      return
    }

    let cancelled = false
    let timeoutId = 0
    let firstRafId = 0
    let secondRafId = 0

    const measureAndStart = () => {
      const iconRect = iconShellRef.current?.getBoundingClientRect()

      if (!iconRect || cancelled) {
        setEnableLoopRotation(true)
        return
      }

      setIntroFrame({
        from: createViewportFrame(),
        to: createTargetFrame(iconRect),
      })
      setShowIntro(true)

      timeoutId = window.setTimeout(() => {
        if (cancelled) {
          return
        }

        setShowIntro(false)
        setEnableLoopRotation(true)
      }, 1950)
    }

    const waitForStableLayout = async () => {
      if ("fonts" in document) {
        try {
          await document.fonts.ready
        } catch {
          // ignore font readiness issues and measure anyway
        }
      }

      if (cancelled) {
        return
      }

      firstRafId = window.requestAnimationFrame(() => {
        secondRafId = window.requestAnimationFrame(measureAndStart)
      })
    }

    void waitForStableLayout()

    return () => {
      cancelled = true
      window.cancelAnimationFrame(firstRafId)
      window.cancelAnimationFrame(secondRafId)
      window.clearTimeout(timeoutId)
    }
  }, [shouldReduceMotion])

  return (
    <>
      <AnimatePresence>
        {showIntro && introFrame ? (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none fixed z-50 overflow-hidden border border-[rgba(232,223,211,0.76)] bg-[rgba(251,248,242,0.12)] shadow-[0_1.35rem_2.8rem_-2rem_rgba(30,24,17,0.34)] backdrop-blur-[10px]"
            initial={introFrame.from}
            animate={{
              ...introFrame.to,
              boxShadow: [
                "0 1.35rem 2.8rem -2rem rgba(30,24,17,0.34)",
                "0 0.8rem 1.75rem -1.4rem rgba(30,24,17,0.22)",
                "0 0.45rem 1rem -0.9rem rgba(30,24,17,0.16)",
              ],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.7, ease: [0.18, 1, 0.32, 1] }}
          >
            <motion.div
              className="absolute inset-[1px] rounded-[inherit] border border-[rgba(255,255,255,0.52)] bg-[linear-gradient(180deg,rgba(255,255,255,0.2),rgba(255,255,255,0.04))]"
              initial={{ opacity: 0.85 }}
              animate={{ opacity: [0.85, 0.46, 0.12] }}
              transition={{ duration: 1.7, ease: [0.18, 1, 0.32, 1] }}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <section className="swift-surface rounded-lg p-5 sm:hidden">
        <div className="flex items-center gap-4">
          <motion.div
            ref={iconShellRef}
            className="flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center rounded-full border border-border bg-[#f8f2e8]"
            initial={shouldReduceMotion ? false : { opacity: 0.92 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: shouldReduceMotion ? 0 : 0.42, ease: [0.18, 1, 0.32, 1] }}
          >
            <motion.div
              aria-hidden="true"
              className={`${enableLoopRotation ? "mobile-rotate-device " : ""}flex h-11 w-7 items-center justify-center rounded-[0.95rem] border border-[#c6ae8d] bg-[#f1e3cd] shadow-[0_0.7rem_1.25rem_-0.9rem_rgba(30,24,17,0.45)]`}
              initial={shouldReduceMotion ? false : { rotate: -4, scale: 0.96 }}
              animate={{
                rotate: enableLoopRotation || shouldReduceMotion ? 0 : [-4, -1, 0],
                scale: enableLoopRotation || shouldReduceMotion ? 1 : [0.96, 0.985, 1],
              }}
              transition={{
                duration: 1.2,
                delay: shouldReduceMotion ? 0 : 0.5,
                ease: [0.18, 1, 0.32, 1],
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#9b7f5a]" />
            </motion.div>
          </motion.div>

          <motion.div
            className="space-y-1.5"
            initial={shouldReduceMotion ? false : { opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.82,
              delay: shouldReduceMotion ? 0 : 0.72,
              ease: [0.18, 1, 0.32, 1],
            }}
          >
            <p className="text-[0.68rem] uppercase tracking-[0.14em] text-muted">
              mobile tips
            </p>
            <p className="text-sm leading-relaxed text-text-secondary">
              The catalog is lighter on mobile now. Open a dedicated algorithm page when you want the full visualizer experience.
            </p>
            <p className="text-sm leading-relaxed text-text-muted-dark">
              Inside the visualizer, rotate for wider charts and swipe left or right to move between steps.
            </p>
          </motion.div>
        </div>
      </section>
    </>
  )
}
