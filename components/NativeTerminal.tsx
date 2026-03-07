"use client"

import DesktopTerminal from "@/components/terminal/DesktopTerminal"
import { useTerminalBadges } from "@/hooks/terminal/use-terminal-badges"
import { useTerminalController } from "@/hooks/terminal/use-terminal-controller"

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
