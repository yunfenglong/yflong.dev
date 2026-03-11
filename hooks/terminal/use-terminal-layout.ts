"use client"

import { useCallback, useEffect, useRef, useState, type RefObject } from "react"

const TERMINAL_MIN_HEIGHT_REM = 15
const TERMINAL_MAX_HEIGHT_REM = 26
const TERMINAL_MIN_VIEWPORT_WIDTH_REM = 61.25
const TERMINAL_TARGET_VIEWPORT_RATIO = 0.44
const STACK_GAP_REM = 2.5
const VIEWPORT_BOTTOM_GAP_RATIO = 0.02
const HEIGHT_SAFETY_BUFFER_REM = 0.25
const DEFAULT_TERMINAL_CHROME_REM = 4.5

export function useTerminalLayout(terminalRef: RefObject<HTMLDivElement | null>) {
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

  return {
    rootRef,
    introRef,
    terminalShellRef,
    terminalBodyHeightRem,
    showTerminal
  }
}
