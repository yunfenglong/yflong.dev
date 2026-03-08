import { fileSystem, fileContents, systemOutputs } from "@/config/terminal"
import { ctfFinalFlag, ctfSourceToken } from "@/config/ctf"
import { profileConfig, projectCaseStudies } from "@/config/profile"
import { TerminalLine } from "@/types/terminal"

const HOME_DIRECTORY = "/home/yflong"
const UNKNOWN_FILE_FALLBACK = (filename: string) =>
  `File contents of ${filename}...\nWelcome to yflong's secure terminal.\nYou are not authorized to view this file.\nTry 'sudo' or contact the person who own this file.`

interface CommandDefinition {
  name: string
  usage: string
  description: string
}

const commandCatalog: CommandDefinition[] = [
  { name: "help", usage: "help", description: "Show this help message" },
  {
    name: "ls",
    usage: "ls [options]",
    description: "List directory contents (-l for detailed, -la for all)",
  },
  { name: "pwd", usage: "pwd", description: "Print working directory" },
  {
    name: "cd",
    usage: "cd <dir>",
    description: "Change directory (.. for parent, ~ for home)",
  },
  { name: "cat", usage: "cat <file>", description: "Display file contents" },
  { name: "whoami", usage: "whoami", description: "Display current user" },
  { name: "about", usage: "about", description: "Show profile summary" },
  {
    name: "projects",
    usage: "projects",
    description: "Show project highlights and route",
  },
  { name: "contact", usage: "contact", description: "Show contact channels" },
  { name: "date", usage: "date", description: "Show current date and time" },
  {
    name: "uname",
    usage: "uname [-a]",
    description: "System information (-a for all)",
  },
  { name: "ps", usage: "ps", description: "Show running processes" },
  { name: "top", usage: "top", description: "Show system processes" },
  { name: "free", usage: "free", description: "Show memory usage" },
  { name: "df", usage: "df", description: "Show disk usage" },
  { name: "uptime", usage: "uptime", description: "Show system uptime" },
  { name: "clear", usage: "clear", description: "Clear terminal" },
  { name: "history", usage: "history", description: "Show command history" },
  { name: "echo", usage: "echo <text>", description: "Display text" },
  { name: "mkdir", usage: "mkdir <dir>", description: "Create directory" },
  { name: "touch", usage: "touch <file>", description: "Create empty file" },
  { name: "rm", usage: "rm <file>", description: "Remove file" },
  { name: "tree", usage: "tree", description: "Show directory tree" },
  {
    name: "neofetch",
    usage: "neofetch",
    description: "System information display",
  },
  {
    name: "ctf",
    usage: "ctf <start|status|hint|submit>",
    description: "Mini CTF challenge",
  },
  { name: "trace", usage: "trace", description: "Shortcut into CTF flow" },
  {
    name: "blog",
    usage: "blog [open|latest]",
    description: "Show blog routes and latest post hint",
  },
  { name: "exit", usage: "exit", description: "Close terminal session" },
]

export const availableCommands = commandCatalog.map((command) => command.name)

export interface CtfProgress {
  started: boolean
  step: 1 | 2 | 3
  solved: boolean
  stepOneAnswer?: string
  stepTwoAnswer?: string
}

export interface CommandContext {
  currentDirectory: string
  setCurrentDirectory: (dir: string) => void
  addLine: (type: TerminalLine["type"], content: string) => void
  commandHistory: string[]
  clearLines: () => void
  terminateSession: () => void
  ctfProgress: CtfProgress
  setCtfProgress: (next: CtfProgress) => void
  unlockVault: () => void
}

type CommandHandler = (args: string[], ctx: CommandContext) => void

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "K", "M", "G", "T"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i]
}

const normalizePath = (path: string): string => {
  const parts = path.split("/").filter(Boolean)
  return parts.length === 0 ? "/" : `/${parts.join("/")}`
}

const getParentDirectory = (path: string): string => {
  const segments = normalizePath(path).split("/").filter(Boolean)
  if (segments.length <= 1) {
    return "/"
  }
  segments.pop()
  return `/${segments.join("/")}`
}

const toAbsolutePath = (target: string, currentDirectory: string): string => {
  if (target.startsWith("/")) {
    return normalizePath(target)
  }
  if (currentDirectory === "/") {
    return normalizePath(`/${target}`)
  }
  return normalizePath(`${currentDirectory}/${target}`)
}

const isKnownDirectory = (path: string): boolean => Boolean(fileSystem[path])

const renderHelpOutput = (): string => {
  const rows = commandCatalog.map((command) => {
    return `  ${command.usage.padEnd(14)} - ${command.description}`
  })
  return `Available commands:\n${rows.join("\n")}`
}

const renderAboutOutput = (): string =>
  [
    `${profileConfig.name}`,
    `${profileConfig.elevatorPitch}`,
    `Role target: ${profileConfig.targetRole}`,
    `Location: ${profileConfig.location} (${profileConfig.timezone})`,
    "Key stack: Next.js, React, TypeScript, automation, observability",
  ].join("\n")

const renderProjectsOutput = (): string => {
  const lines = projectCaseStudies.map((project) => `  - ${project.title} [${project.status}]`)
  return ["Project highlights:", ...lines, "Open full breakdown: /projects"].join("\n")
}

const renderContactOutput = (): string =>
  [
    "Contact channels:",
    `  - email: ${profileConfig.email}`,
    `  - linkedin: ${profileConfig.linkedin}`,
    `  - github: ${profileConfig.github}`,
    "Contact page: /contact",
  ].join("\n")

const CTF_STEP_ONE_ANSWER = "true"

const normalizeSubmission = (value: string): string => value.trim().toLowerCase()

const renderCtfStepOnePrompt = (): string =>
  [
    "[1/3] Recon objective",
    "Inspect ~/config.py and extract the value after LOGGER =",
    "Submit with: ctf submit <value>",
  ].join("\n")

const renderCtfStepTwoPrompt = (): string =>
  [
    "[2/3] Source objective",
    "Inspect the homepage source (or DOM) and find `data-ctf-token` on the main element.",
    "Submit with: ctf submit <token>",
  ].join("\n")

const renderCtfStepThreePrompt = (progress: CtfProgress): string => {
  const stepOne = progress.stepOneAnswer ?? "STEP_1_ANSWER"
  const stepTwo = progress.stepTwoAnswer ?? "STEP_2_TOKEN"

  return [
    "[3/3] Logic objective",
    "Compute the final flag with:",
    "seal(a, b) = `${a.slice(0, 2).toLowerCase()}-${b.split('-').map((word) => word[0]).join('')}-${a.length + b.length}`",
    `a = ${stepOne}`,
    `b = ${stepTwo}`,
    "Submit with: ctf submit <flag>",
  ].join("\n")
}

const renderCtfStatus = (progress: CtfProgress): string => {
  if (!progress.started) {
    return "CTF status: idle\nRun `trace` or `ctf start` to begin."
  }

  if (progress.solved) {
    return "CTF status: solved\nVault access granted at /vault."
  }

  return `CTF status: active\nCurrent step: ${progress.step}/3\nUse \`ctf hint\` or \`ctf submit <answer>\`.`
}

const renderCtfHint = (progress: CtfProgress): string => {
  if (!progress.started) {
    return "No active challenge. Run `ctf start`."
  }

  if (progress.solved) {
    return "Challenge complete. Open /vault."
  }

  if (progress.step === 1) {
    return "Hint 1: `cat config.py` from your home directory."
  }

  if (progress.step === 2) {
    return "Hint 2: The token is a lowercase phrase joined by hyphens."
  }

  return "Hint 3: The middle chunk is the initials of every hyphen-separated word in step 2."
}

const commandHandlers: Record<string, CommandHandler> = {
  help: (_, ctx) => {
    ctx.addLine("output", renderHelpOutput())
  },

  ls: (args, ctx) => {
    const currentItems = fileSystem[ctx.currentDirectory] || []
    if (currentItems.length === 0) {
      ctx.addLine("output", "Directory is empty")
      return
    }

    const hasLongFlag = args.includes("-l") || args.includes("-la")
    const showHidden = args.includes("-la") || args.includes("-a")
    const itemsToShow = showHidden
      ? currentItems
      : currentItems.filter((item) => !item.name.startsWith("."))

    if (!hasLongFlag) {
      const itemNames = itemsToShow
        .map((item) => (item.type === "directory" ? `${item.name}/` : item.name))
        .join("  ")
      ctx.addLine("output", itemNames)
      return
    }

    ctx.addLine("output", `total ${itemsToShow.length}`)
    itemsToShow.forEach((item) => {
      const size = item.size ? formatFileSize(item.size).padStart(8) : "     4.0K"
      const date =
        item.modified?.toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
        }) || "Jan 15"
      const time =
        item.modified?.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }) || "12:00"
      const permissions =
        item.permissions ||
        (item.type === "directory" ? "drwxr-xr-x" : "-rw-r--r--")

      ctx.addLine(
        "output",
        `${permissions} 1 yflong yflong ${size} ${date} ${time} ${item.name}`,
      )
    })
  },

  pwd: (_, ctx) => {
    ctx.addLine("output", ctx.currentDirectory)
  },

  cd: (args, ctx) => {
    const targetDir = args[0]

    if (!targetDir || targetDir === "~") {
      ctx.setCurrentDirectory(HOME_DIRECTORY)
      ctx.addLine("success", "Changed to home directory")
      return
    }

    if (targetDir === "..") {
      const parentDirectory = getParentDirectory(ctx.currentDirectory)
      ctx.setCurrentDirectory(parentDirectory)
      if (parentDirectory === "/") {
        ctx.addLine("success", "Changed to root directory")
      } else {
        ctx.addLine("success", `Changed to ${parentDirectory}`)
      }
      return
    }

    if (targetDir === ".") {
      ctx.addLine("success", `Already in ${ctx.currentDirectory}`)
      return
    }

    const absolutePath = toAbsolutePath(targetDir, ctx.currentDirectory)
    if (targetDir.startsWith("/")) {
      if (isKnownDirectory(absolutePath)) {
        ctx.setCurrentDirectory(absolutePath)
        ctx.addLine("success", `Changed to ${absolutePath}`)
      } else {
        ctx.addLine("error", `cd: ${targetDir}: No such file or directory`)
      }
      return
    }

    const currentItems = fileSystem[ctx.currentDirectory] || []
    const isVisibleChildDirectory = currentItems.some(
      (item) => item.type === "directory" && item.name === targetDir,
    )

    if (isKnownDirectory(absolutePath) || isVisibleChildDirectory) {
      ctx.setCurrentDirectory(absolutePath)
      ctx.addLine("success", `Changed to ${absolutePath}`)
      return
    }

    ctx.addLine("error", `cd: ${targetDir}: No such file or directory`)
  },

  cat: (args, ctx) => {
    const filename = args[0]
    if (!filename) {
      ctx.addLine("error", "cat: missing file operand")
      return
    }

    const currentItems = fileSystem[ctx.currentDirectory] || []
    const file = currentItems.find(
      (item) => item.name === filename && item.type === "file",
    )

    if (!file) {
      ctx.addLine("error", `cat: ${filename}: No such file or directory`)
      return
    }

    const content = fileContents[filename]
    ctx.addLine("output", content ?? UNKNOWN_FILE_FALLBACK(filename))
  },

  whoami: (_, ctx) => {
    ctx.addLine("output", "Yunfeng Long")
  },

  about: (_, ctx) => {
    ctx.addLine("output", renderAboutOutput())
  },

  projects: (_, ctx) => {
    ctx.addLine("output", renderProjectsOutput())
  },

  contact: (_, ctx) => {
    ctx.addLine("output", renderContactOutput())
  },

  date: (_, ctx) => {
    ctx.addLine("output", new Date().toString())
  },

  uname: (args, ctx) => {
    const hasAllFlag = args.includes("-a")
    ctx.addLine("output", hasAllFlag ? systemOutputs.unameAll : systemOutputs.uname)
  },

  ps: (_, ctx) => {
    ctx.addLine("output", systemOutputs.ps)
  },

  top: (_, ctx) => {
    ctx.addLine("output", systemOutputs.top(new Date().toLocaleTimeString()))
  },

  free: (_, ctx) => {
    ctx.addLine("output", systemOutputs.free)
  },

  df: (_, ctx) => {
    ctx.addLine("output", systemOutputs.df)
  },

  uptime: (_, ctx) => {
    ctx.addLine("output", systemOutputs.uptime(new Date().toLocaleTimeString()))
  },

  clear: (_, ctx) => {
    ctx.clearLines()
  },

  history: (_, ctx) => {
    ctx.commandHistory.forEach((command, index) => {
      ctx.addLine("output", `${(index + 1).toString().padStart(4)} ${command}`)
    })
  },

  echo: (args, ctx) => {
    ctx.addLine("output", args.join(" "))
  },

  mkdir: (args, ctx) => {
    const dirName = args[0]
    if (!dirName) {
      ctx.addLine("error", "mkdir: missing operand")
      return
    }
    ctx.addLine("success", `Directory '${dirName}' created successfully`)
  },

  touch: (args, ctx) => {
    const fileName = args[0]
    if (!fileName) {
      ctx.addLine("error", "touch: missing file operand")
      return
    }
    ctx.addLine("success", `File '${fileName}' created successfully`)
  },

  rm: (args, ctx) => {
    const rmFile = args[0]
    if (!rmFile) {
      ctx.addLine("error", "rm: missing operand")
      return
    }
    ctx.addLine("success", `File '${rmFile}' removed successfully`)
  },

  tree: (_, ctx) => {
    ctx.addLine("output", systemOutputs.tree(ctx.currentDirectory))
  },

  neofetch: (_, ctx) => {
    ctx.addLine("output", systemOutputs.neofetch)
  },

  ctf: (args, ctx) => {
    const action = args[0]?.toLowerCase() || "status"

    if (action === "start") {
      if (ctx.ctfProgress.solved) {
        ctx.addLine("success", "CTF already solved. Vault is open at /vault.")
        return
      }

      ctx.setCtfProgress({
        ...ctx.ctfProgress,
        started: true,
        step: 1,
        solved: false,
      })
      ctx.addLine("success", "CTF protocol initialized.")
      ctx.addLine("output", renderCtfStepOnePrompt())
      return
    }

    if (action === "status") {
      ctx.addLine("output", renderCtfStatus(ctx.ctfProgress))
      return
    }

    if (action === "hint") {
      ctx.addLine("output", renderCtfHint(ctx.ctfProgress))
      return
    }

    if (action === "submit") {
      if (!ctx.ctfProgress.started) {
        ctx.addLine("error", "CTF is not active. Run `ctf start` first.")
        return
      }

      const submissionInput = args.slice(1).join(" ")
      if (!submissionInput.trim()) {
        ctx.addLine("error", "Usage: ctf submit <answer>")
        return
      }

      const submission = normalizeSubmission(submissionInput)

      if (ctx.ctfProgress.step === 1) {
        if (submission !== CTF_STEP_ONE_ANSWER) {
          ctx.addLine("error", "Incorrect step 1 answer. Run `ctf hint` if needed.")
          return
        }

        const nextProgress: CtfProgress = {
          ...ctx.ctfProgress,
          started: true,
          step: 2,
          solved: false,
          stepOneAnswer: submission.toUpperCase(),
        }

        ctx.setCtfProgress(nextProgress)
        ctx.addLine("success", "Step 1 cleared.")
        ctx.addLine("output", renderCtfStepTwoPrompt())
        return
      }

      if (ctx.ctfProgress.step === 2) {
        if (submission !== ctfSourceToken) {
          ctx.addLine("error", "Incorrect step 2 token. Run `ctf hint` if needed.")
          return
        }

        const nextProgress: CtfProgress = {
          ...ctx.ctfProgress,
          started: true,
          step: 3,
          solved: false,
          stepTwoAnswer: submission,
        }

        ctx.setCtfProgress(nextProgress)
        ctx.addLine("success", "Step 2 cleared.")
        ctx.addLine("output", renderCtfStepThreePrompt(nextProgress))
        return
      }

      if (ctx.ctfProgress.step === 3) {
        if (submission !== ctfFinalFlag) {
          ctx.addLine("error", "Flag mismatch. Re-check the formula and values.")
          return
        }

        ctx.setCtfProgress({
          ...ctx.ctfProgress,
          solved: true,
        })
        ctx.unlockVault()
        ctx.addLine("success", "Flag accepted. Vault access granted.")
        ctx.addLine("output", "Open /vault to claim the easter egg.")
        return
      }
    }

    ctx.addLine("error", "Usage: ctf <start|status|hint|submit>")
  },

  trace: (_, ctx) => {
    if (!ctx.ctfProgress.started && !ctx.ctfProgress.solved) {
      ctx.addLine("warning", "Trace route enabled. Dropping you into the CTF protocol...")
      commandHandlers.ctf(["start"], ctx)
      return
    }

    ctx.addLine("output", renderCtfStatus(ctx.ctfProgress))
  },

  blog: (_, ctx) => {
    ctx.addLine("output", "Blog routes:")
    ctx.addLine("output", "  - /blog")
    ctx.addLine("output", "  - /blog/building-terminal-style-portfolio")
    ctx.addLine("output", "Tip: open /blog in a new tab.")
  },

  exit: (_, ctx) => {
    ctx.addLine("warning", "Terminal session ended. Refresh page to restart.")
    ctx.terminateSession()
  },
}

export function runCommand(cmd: string, args: string[], ctx: CommandContext) {
  const handler = commandHandlers[cmd]
  if (!handler) {
    ctx.addLine("error", `Command not found: ${cmd}. Type 'help' for available commands.`)
    return
  }
  handler(args, ctx)
}
