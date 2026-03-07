"use client"

import { useIsMobile } from "@/hooks/use-mobile"
import DesktopTerminal from "@/components/terminal/DesktopTerminal"
import MobileTerminalIntro from "@/components/terminal/MobileTerminalIntro"
import { useTerminalBadges } from "@/hooks/terminal/use-terminal-badges"
import { useTerminalController } from "@/hooks/terminal/use-terminal-controller"

const TERMINAL_MOBILE_BREAKPOINT = 1024

function NativeTerminal() {
  const isMobile = useIsMobile(TERMINAL_MOBILE_BREAKPOINT)
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

  if (isMobile) {
    return <MobileTerminalIntro />
  }

  return (
    <DesktopTerminal
      lines={lines}
      currentInput={currentInput}
      currentDirectory={currentDirectory}
      isTerminalActive={isTerminalActive}
      isBooting={isBooting}
      terminalRef={terminalRef}
      inputRef={inputRef}
      currentIP={currentIP}
      showBadges={showBadges}
      onInputChange={setCurrentInput}
      onInputKeyDown={handleKeyDown}
    />
  )
}

export default NativeTerminal
