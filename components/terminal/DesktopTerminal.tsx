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
  terminalRef: RefObject<HTMLDivElement | null>
  inputRef: RefObject<HTMLInputElement | null>
  currentIP: string
  showBadges: BadgeVisibility
  onInputChange: (value: string) => void
  onInputKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
}

const lineTypeClassName: Record<TerminalLine["type"], string> = {
  input: "text-white",
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
  terminalRef,
  inputRef,
  currentIP,
  showBadges,
  onInputChange,
  onInputKeyDown,
}: DesktopTerminalProps) {
  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <motion.div
        className="glass-panel rounded-xl overflow-hidden"
        initial={{ y: 20, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="macos-traffic-lights">
            <div className="macos-traffic-light close"></div>
            <div className="macos-traffic-light minimize"></div>
            <div className="macos-traffic-light maximize"></div>
          </div>
          <div className="hidden sm:flex items-center space-x-3 text-xs">
            <motion.div
              className="glass-badge"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: showBadges.ip ? 1 : 0, x: showBadges.ip ? 0 : 20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <Wifi className="w-3 h-3 text-white" />
              <span className="text-white font-normal">{currentIP}</span>
            </motion.div>
            <motion.div
              className="glass-badge"
              initial={{ opacity: 0, x: 20 }}
              animate={{
                opacity: showBadges.encrypted ? 1 : 0,
                x: showBadges.encrypted ? 0 : 20,
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <Shield className="w-3 h-3 text-gray-300" />
              <span className="text-gray-300 font-normal">ENCRYPTED</span>
            </motion.div>
            <motion.div
              className="glass-badge"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: showBadges.aes ? 1 : 0, x: showBadges.aes ? 0 : 20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <Lock className="w-3 h-3 text-gray-400" />
              <span className="text-gray-400 font-normal">AES-256</span>
            </motion.div>
          </div>
        </div>

        <div
          className="p-6 min-h-[500px] max-h-[600px] overflow-y-auto font-mono text-sm leading-relaxed text-white cursor-text scrollbar-hide"
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
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className={`terminal-line ${lineTypeClassName[line.type]}`}
                >
                  {line.type === "input" ? (
                    <div className="flex items-start">
                      <span className="terminal-prompt flex-shrink-0 text-blue-600">
                        {currentDirectory} $
                      </span>
                      <span className="font-mono ml-2">{line.content}</span>
                    </div>
                  ) : (
                    <pre className="font-mono whitespace-pre-wrap leading-relaxed">
                      {line.content}
                    </pre>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {isTerminalActive && !isBooting && (
            <div className="terminal-line mt-4">
              <div className="flex items-center">
                <span className="terminal-prompt flex-shrink-0 text-blue-600">
                  {currentDirectory} $
                </span>
                <div className="flex items-center ml-2 relative">
                  <span className="font-mono text-white">{currentInput}</span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={currentInput}
                    onChange={(event) => onInputChange(event.target.value)}
                    onKeyDown={onInputKeyDown}
                    className="absolute bg-transparent border-none outline-none font-mono text-sm w-full"
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
