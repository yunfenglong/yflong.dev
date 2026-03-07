"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { AppWindow, Atom, BrainCircuit, Braces, Linkedin } from "lucide-react"
import DesktopTerminal from "@/components/terminal/DesktopTerminal"
import { useTerminalBadges } from "@/hooks/terminal/use-terminal-badges"
import { useTerminalController } from "@/hooks/terminal/use-terminal-controller"

const introTitle = "Yunfeng Long"

const introLines = [
  "Front-end development, automation, web technologies.",
  "Focused on modern web development practices.",
]

const TERMINAL_MIN_HEIGHT_REM = 15
const TERMINAL_MAX_HEIGHT_REM = 26
const TERMINAL_MIN_VIEWPORT_WIDTH_REM = 61.25
const TERMINAL_TARGET_VIEWPORT_RATIO = 0.44
const STACK_GAP_REM = 2.5
const VIEWPORT_BOTTOM_GAP_RATIO = 0.05
const HEIGHT_SAFETY_BUFFER_REM = 0.25
const DEFAULT_TERMINAL_CHROME_REM = 4.5

function NativeTerminal() {
  const {
    lines,
    currentInput,
    setCurrentInput,
    currentDirectory,
    isTerminalActive,
    isBooting,
    terminalRef,
    inputRef,
    handleKeyDown,
  } = useTerminalController()

  const { currentIP, showBadges } = useTerminalBadges()
  const rootRef = useRef<HTMLDivElement | null>(null)
  const introRef = useRef<HTMLDivElement | null>(null)
  const terminalShellRef = useRef<HTMLDivElement | null>(null)
  const terminalChromeHeightPxRef = useRef(DEFAULT_TERMINAL_CHROME_REM * 16)
  const [terminalBodyHeightRem, setTerminalBodyHeightRem] = useState(TERMINAL_MIN_HEIGHT_REM)
  const [showTerminal, setShowTerminal] = useState(true)

  const recalculateTerminalLayout = useCallback(() => {
    if (typeof window === "undefined" || !rootRef.current || !introRef.current) {
      return
    }

    const rootFontPx =
      Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
    const viewportWidthRem = window.innerWidth / rootFontPx

    if (viewportWidthRem < TERMINAL_MIN_VIEWPORT_WIDTH_REM) {
      setShowTerminal(false)
      return
    }

    const minBodyHeightPx = TERMINAL_MIN_HEIGHT_REM * rootFontPx
    const maxBodyHeightPx = TERMINAL_MAX_HEIGHT_REM * rootFontPx
    const targetBodyHeightPx = Math.min(
      maxBodyHeightPx,
      Math.max(minBodyHeightPx, window.innerHeight * TERMINAL_TARGET_VIEWPORT_RATIO),
    )
    const viewportBottomGapPx = window.innerHeight * VIEWPORT_BOTTOM_GAP_RATIO
    const heightSafetyBufferPx = HEIGHT_SAFETY_BUFFER_REM * rootFontPx

    const rootTopPx = rootRef.current.getBoundingClientRect().top
    const maxWholeHeightPx =
      window.innerHeight - rootTopPx - viewportBottomGapPx - heightSafetyBufferPx

    if (maxWholeHeightPx <= 0) {
      setShowTerminal(false)
      return
    }

    if (terminalShellRef.current && terminalRef.current) {
      const shellHeightPx = terminalShellRef.current.getBoundingClientRect().height
      const bodyHeightPx = terminalRef.current.getBoundingClientRect().height
      const measuredTerminalChromePx = shellHeightPx - bodyHeightPx
      if (measuredTerminalChromePx > 0) {
        terminalChromeHeightPxRef.current = measuredTerminalChromePx
      }
    }

    const introHeightPx = introRef.current.getBoundingClientRect().height
    const stackGapPx = STACK_GAP_REM * rootFontPx
    const availableBodyHeightPx =
      maxWholeHeightPx - introHeightPx - stackGapPx - terminalChromeHeightPxRef.current

    if (availableBodyHeightPx < minBodyHeightPx) {
      setShowTerminal(false)
      return
    }

    setShowTerminal(true)
    setTerminalBodyHeightRem(
      Math.min(availableBodyHeightPx, targetBodyHeightPx) / rootFontPx,
    )
  }, [terminalRef])

  useEffect(() => {
    recalculateTerminalLayout()

    const handleResize = () => {
      recalculateTerminalLayout()
    }

    window.addEventListener("resize", handleResize)

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            recalculateTerminalLayout()
          })
        : null

    if (resizeObserver && introRef.current) {
      resizeObserver.observe(introRef.current)
    }

    if (resizeObserver && terminalShellRef.current) {
      resizeObserver.observe(terminalShellRef.current)
    }

    return () => {
      window.removeEventListener("resize", handleResize)
      resizeObserver?.disconnect()
    }
  }, [recalculateTerminalLayout, showTerminal])

  return (
    <div ref={rootRef} className="w-full space-y-10">
      <div ref={introRef} className="w-full max-w-[61.25rem] mx-auto px-0">
        <p className="text-[0.6875rem] uppercase tracking-[0.14em] text-[#8f8475] mb-1">intro</p>
        <h1 className="aman-display text-[1.625rem] sm:text-[1.875rem] leading-none text-[#3b342c] mb-2">
          {introTitle}
        </h1>
        <div className="space-y-1 text-sm sm:text-[0.9375rem] leading-relaxed text-[#5f5446]">
          <p>
            Third-year computer science student at{" "}
            <a
              href="https://www.monash.edu/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-[#3b342c] transition-colors"
            >
              Monash University
            </a>
            .
          </p>
          {introLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
          <p className="flex items-center gap-1.5">
            <span className="text-[#8a7451]">Connect with me on</span>
            <Linkedin className="w-4 h-4 text-[#8a7451]" />
            <a
              href="https://www.linkedin.com/in/yunfeng-l/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 text-[#8a7451] transition-colors"
            >
              LinkedIn
            </a>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className="swift-chip normal-case tracking-normal font-medium">
            <Atom className="w-3 h-3" /> React
          </span>
          <span className="swift-chip normal-case tracking-normal font-medium">
            <Braces className="w-3 h-3" /> TypeScript
          </span>
          <span className="swift-chip normal-case tracking-normal font-medium">
            <AppWindow className="w-3 h-3" /> Next.js
          </span>
          <span className="swift-chip normal-case tracking-normal font-medium">
            <BrainCircuit className="w-3 h-3" /> ML Integration
          </span>
        </div>
      </div>

      {showTerminal && (
        <DesktopTerminal
          lines={lines}
          currentInput={currentInput}
          currentDirectory={currentDirectory}
          isTerminalActive={isTerminalActive}
          isBooting={isBooting}
          terminalBodyHeightRem={terminalBodyHeightRem}
          shellRef={terminalShellRef}
          terminalRef={terminalRef}
          inputRef={inputRef}
          currentIP={currentIP}
          showBadges={showBadges}
          onInputChange={setCurrentInput}
          onInputKeyDown={handleKeyDown}
        />
      )}
    </div>
  )
}

export default NativeTerminal
