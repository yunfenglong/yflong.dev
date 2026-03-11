"use client"

import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import { AppWindow, Atom, BrainCircuit, Braces, Linkedin } from "lucide-react"
import DesktopTerminal from "@/components/terminal/DesktopTerminal"
import { profileConfig, projectCaseStudies } from "@/config/profile"
import { useTerminalBadges } from '@/hooks/terminal/use-terminal-badges'
import { useTerminalController } from '@/hooks/terminal/use-terminal-controller'
import { useTerminalLayout } from '@/hooks/terminal/use-terminal-layout'

const introTitle = `Hey, I'm ${profileConfig.name}`

const introLines = [profileConfig.headline, `Targeting ${profileConfig.targetRole}.`]



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
  const { rootRef, introRef, terminalShellRef, terminalBodyHeightRem, showTerminal } = useTerminalLayout(terminalRef as React.RefObject<HTMLDivElement | null>)


  return (
    <div ref={rootRef} className="w-full space-y-10">
      <div ref={introRef} className="w-full max-w-[61.25rem] mx-auto px-0">
        <p className="text-[0.6875rem] uppercase tracking-[0.14em] text-muted mb-1">intro</p>
        <h1 className="aman-display text-[1.625rem] sm:text-[1.875rem] leading-none text-text-primary mb-2">
          {introTitle}
        </h1>
        <div className="space-y-1 text-sm sm:text-[0.9375rem] leading-relaxed text-text-muted-dark">
          <p>
            Third-year computer science student at{" "}
            <a
              href="https://www.monash.edu/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-text-primary transition-colors"
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
              href={profileConfig.linkedin}
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

      {!showTerminal && (
        <section className="w-full max-w-[45.9375rem] mx-auto swift-surface rounded-lg p-5 sm:p-6 space-y-4">
          <div className="space-y-1">
            <p className="text-[0.67rem] uppercase tracking-[0.14em] text-muted">quick overview</p>
            <h2 className="aman-display text-[1.35rem] leading-tight text-text-primary">
              Portfolio Snapshot
            </h2>
            <p className="text-sm text-text-muted-dark leading-relaxed">
              Use the quick links below to review projects and contact details.
            </p>
          </div>

          <div className="space-y-2">
            {projectCaseStudies.slice(0, 2).map((project) => (
              <article key={project.id} className="rounded-md border border-border bg-[#f7f2e9] p-3">
                <p className="text-[0.66rem] uppercase tracking-[0.12em] text-muted">
                  {project.status}
                </p>
                <p className="text-sm font-medium text-[#3f372e]">{project.title}</p>
                <p className="text-xs text-text-muted-dark mt-1">{project.summary}</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default NativeTerminal
