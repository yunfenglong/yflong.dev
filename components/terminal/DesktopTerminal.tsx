"use client"

import type { KeyboardEvent, RefObject } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Lock, Shield, Wifi } from "lucide-react"
import type { TerminalLine } from "@/types/terminal"

interface BadgeVisibility {
  aes: boolean
  encrypted: boolean
  ip: boolean
}

interface DesktopTerminalProps {
  lines: TerminalLine[]
  currentInput: string
  currentDirectory: string
  isTerminalActive: boolean
  isBooting: boolean
  terminalBodyHeightRem: number
  shellRef: RefObject<HTMLDivElement | null>
  terminalRef: RefObject<HTMLDivElement | null>
  inputRef: RefObject<HTMLInputElement | null>
  currentIP: string
  showBadges: BadgeVisibility
  onInputChange: (value: string) => void
  onInputKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
}

const lineTypeClassName: Record<TerminalLine["type"], string> = {
  input: "text-[#40372d]",
  output: "terminal-output",
  error: "terminal-error",
  success: "terminal-success",
  warning: "terminal-warning",
}

export default function DesktopTerminal({
  lines,
  currentInput,
  currentDirectory,
  isTerminalActive,
  isBooting,
  terminalBodyHeightRem,
  shellRef,
  terminalRef,
  inputRef,
  currentIP,
  showBadges,
  onInputChange,
  onInputKeyDown,
}: DesktopTerminalProps) {
  return (
    <div className="w-full max-w-[45.9375rem] mx-auto px-0">
      <motion.div
        ref={shellRef}
        className="swift-surface-strong w-full rounded-lg overflow-hidden"
        initial={{ y: 18, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center justify-between px-4 py-2 border-b border-[#d7ccbc]">
          <div className="macos-traffic-lights" aria-hidden="true">
            <div className="macos-traffic-light close" />
            <div className="macos-traffic-light minimize" />
            <div className="macos-traffic-light maximize" />
          </div>

          <span className="aman-eyebrow">private console</span>

          <div className="hidden sm:flex items-center gap-2 text-xs">
            <motion.div
              className="swift-chip"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: showBadges.ip ? 1 : 0, x: showBadges.ip ? 0 : 10 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <Wifi className="w-3 h-3 text-[#6d5f4f]" />
              <span>{currentIP}</span>
            </motion.div>
            <motion.div
              className="swift-chip"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: showBadges.encrypted ? 1 : 0, x: showBadges.encrypted ? 0 : 10 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <Shield className="w-3 h-3 text-[#6d5f4f]" />
              <span>encrypted</span>
            </motion.div>
            <motion.div
              className="swift-chip"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: showBadges.aes ? 1 : 0, x: showBadges.aes ? 0 : 10 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <Lock className="w-3 h-3 text-[#6d5f4f]" />
              <span>aes-256</span>
            </motion.div>
          </div>
        </div>

        <div
          className="p-3 sm:p-4 overflow-y-auto font-mono text-[0.8rem] leading-relaxed text-[#4a4033] cursor-text scrollbar-hide"
          style={{ height: `${terminalBodyHeightRem}rem` }}
          ref={terminalRef}
          onClick={() => inputRef.current?.focus()}
        >
          <div className="space-y-1">
            <AnimatePresence>
              {lines.map((line) => (
                <motion.div
                  key={line.id}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  transition={{ duration: 0.14, ease: "easeOut" }}
                  className={`terminal-line ${lineTypeClassName[line.type]}`}
                >
                  {line.type === "input" ? (
                    <div className="flex items-start">
                      <span className="terminal-prompt flex-shrink-0">{currentDirectory} $</span>
                      <span className="font-mono ml-2 text-[#40372d]">{line.content}</span>
                    </div>
                  ) : (
                    <pre className="font-mono whitespace-pre-wrap leading-relaxed">{line.content}</pre>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {isTerminalActive && !isBooting && (
            <div className="terminal-line mt-3">
              <div className="flex items-center">
                <span className="terminal-prompt flex-shrink-0">{currentDirectory} $</span>
                <div className="flex items-center ml-2 relative">
                  <span className="font-mono text-[#40372d]">{currentInput}</span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={currentInput}
                    onChange={(event) => onInputChange(event.target.value)}
                    onKeyDown={onInputKeyDown}
                    className="absolute bg-transparent border-none outline-none font-mono text-[0.8rem] text-[#40372d] w-full"
                    style={{ width: `${Math.max(1, currentInput.length + 1)}ch` }}
                    autoFocus
                    spellCheck={false}
                    autoComplete="off"
                    autoCapitalize="off"
                    autoCorrect="off"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
