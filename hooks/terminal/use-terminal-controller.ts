"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { KeyboardEvent } from "react"
import { bootMessages } from "@/config/terminal"
import { availableCommands, runCommand } from "@/lib/terminal/commands"
import type { TerminalLine } from "@/types/terminal"

const HOME_DIRECTORY = "/home/yflong"
const MAX_COMMAND_HISTORY = 100

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })

const getBootLineType = (content: string): TerminalLine["type"] => {
  if (/successful|established|active/i.test(content)) {
    return "success"
  }
  return "output"
}

export function useTerminalController() {
  const [lines, setLines] = useState<TerminalLine[]>([])
  const [currentInput, setCurrentInput] = useState("")
  const [currentDirectory, setCurrentDirectory] = useState(HOME_DIRECTORY)
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isTerminalActive, setIsTerminalActive] = useState(true)
  const [hasInitialized, setHasInitialized] = useState(false)
  const [isBooting, setIsBooting] = useState(true)

  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const lineIdRef = useRef(0)
  const bootSequenceStarted = useRef(false)
  const commandHistoryRef = useRef<string[]>([])

  useEffect(() => {
    commandHistoryRef.current = commandHistory
  }, [commandHistory])

  const addLine = useCallback((type: TerminalLine["type"], content: string) => {
    setLines((prevLines) => [
      ...prevLines,
      {
        id: lineIdRef.current++,
        type,
        content,
        timestamp: new Date(),
      },
    ])
  }, [])

  const terminateSession = useCallback(() => {
    setIsTerminalActive(false)
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.disabled = true
      }
    }, 100)
  }, [])

  const executeCommand = useCallback(
    (command: string) => {
      const trimmedCommand = command.trim()
      if (!trimmedCommand) return

      const nextHistory = [...commandHistoryRef.current, trimmedCommand].slice(
        -MAX_COMMAND_HISTORY,
      )
      commandHistoryRef.current = nextHistory
      setCommandHistory(nextHistory)
      setHistoryIndex(-1)

      addLine("input", trimmedCommand)

      const [cmd, ...args] = trimmedCommand.split(/\s+/)
      runCommand(cmd.toLowerCase(), args, {
        currentDirectory,
        setCurrentDirectory,
        addLine,
        commandHistory: nextHistory,
        clearLines: () => setLines([]),
        terminateSession,
      })
    },
    [addLine, currentDirectory, terminateSession],
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (!isTerminalActive || isBooting) return

      if (event.key === "Enter") {
        event.preventDefault()
        executeCommand(currentInput)
        setCurrentInput("")
        return
      }

      if (event.key === "ArrowUp") {
        event.preventDefault()
        if (commandHistory.length === 0) return

        const newIndex =
          historyIndex === -1
            ? commandHistory.length - 1
            : Math.max(0, historyIndex - 1)
        setHistoryIndex(newIndex)
        setCurrentInput(commandHistory[newIndex])
        return
      }

      if (event.key === "ArrowDown") {
        event.preventDefault()
        if (historyIndex === -1) return

        const newIndex = historyIndex + 1
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1)
          setCurrentInput("")
          return
        }

        setHistoryIndex(newIndex)
        setCurrentInput(commandHistory[newIndex])
        return
      }

      if (event.key === "Tab") {
        event.preventDefault()
        const currentCommand = currentInput.toLowerCase().trim()
        if (!currentCommand) return

        const matches = availableCommands.filter((cmd) =>
          cmd.startsWith(currentCommand),
        )
        if (matches.length === 1) {
          setCurrentInput(matches[0])
          return
        }
        if (matches.length > 1) {
          addLine("output", matches.join("  "))
        }
        return
      }

      if (event.ctrlKey && event.key.toLowerCase() === "l") {
        event.preventDefault()
        setLines([])
      }
    },
    [
      addLine,
      commandHistory,
      currentInput,
      executeCommand,
      historyIndex,
      isBooting,
      isTerminalActive,
    ],
  )

  useEffect(() => {
    if (!terminalRef.current) return
    terminalRef.current.scrollTop = terminalRef.current.scrollHeight
  }, [lines])

  useEffect(() => {
    if (hasInitialized || !isBooting || bootSequenceStarted.current) return
    bootSequenceStarted.current = true

    let isCancelled = false

    const runBootSequence = async () => {
      await sleep(2000)

      for (const message of bootMessages) {
        if (isCancelled) return
        await sleep(message.delay)
        if (isCancelled) return

        setLines((prevLines) => [
          ...prevLines,
          {
            id: lineIdRef.current++,
            type: getBootLineType(message.content),
            content: message.content,
            timestamp: new Date(),
          },
        ])
      }

      await sleep(500)

      for (let i = bootMessages.length - 1; i >= 0; i -= 1) {
        if (isCancelled) return
        setLines((prevLines) => prevLines.slice(0, -1))
        await sleep(80)
      }

      await sleep(500)
      if (isCancelled) return

      setIsBooting(false)
      setHasInitialized(true)
    }

    void runBootSequence()

    return () => {
      isCancelled = true
    }
  }, [hasInitialized, isBooting])

  useEffect(() => {
    const focusInput = () => {
      if (!inputRef.current) return
      if (inputRef.current.disabled || !isTerminalActive || isBooting) return
      inputRef.current.focus()
    }

    focusInput()
    document.addEventListener("click", focusInput)
    return () => document.removeEventListener("click", focusInput)
  }, [isBooting, isTerminalActive])

  return {
    lines,
    currentInput,
    setCurrentInput,
    currentDirectory,
    isTerminalActive,
    isBooting,
    terminalRef,
    inputRef,
    handleKeyDown,
  }
}
