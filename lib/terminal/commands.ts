import { Dispatch, RefObject, SetStateAction } from 'react'
import { fileSystem, fileContents, systemOutputs } from '@/config/terminal'
import { TerminalLine } from '@/types/terminal'

export interface CommandContext {
  currentDirectory: string
  setCurrentDirectory: (dir: string) => void
  addLine: (type: TerminalLine['type'], content: string) => void
  commandHistory: string[]
  setLines: Dispatch<SetStateAction<TerminalLine[]>>
  setIsTerminalActive: (active: boolean) => void
  inputRef: RefObject<HTMLInputElement>
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'K', 'M', 'G', 'T']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i]
}

export function runCommand(cmd: string, args: string[], ctx: CommandContext) {
  switch (cmd) {
    case 'help':
      ctx.addLine('output', `Available commands:\n  help          - Show this help message\n  ls [options]  - List directory contents (-l for detailed, -la for all)\n  pwd           - Print working directory\n  cd <dir>      - Change directory (.. for parent, ~ for home)\n  cat <file>    - Display file contents\n  whoami        - Display current user\n  date          - Show current date and time\n  uname [-a]    - System information (-a for all)\n  ps            - Show running processes\n  clear         - Clear terminal\n  history       - Show command history\n  echo <text>   - Display text\n  mkdir <dir>   - Create directory\n  touch <file>  - Create empty file\n  rm <file>     - Remove file\n  tree          - Show directory tree\n  neofetch      - System information display\n  uptime        - Show system uptime\n  df            - Show disk usage\n  free          - Show memory usage\n  top           - Show system processes\n  exit          - Close terminal session`)
      break

    case 'ls':
      const currentItems = fileSystem[ctx.currentDirectory] || []
      if (currentItems.length === 0) {
        ctx.addLine('output', 'Directory is empty')
      } else {
        const hasLongFlag = args.includes('-l') || args.includes('-la')
        const showHidden = args.includes('-la') || args.includes('-a')

        let itemsToShow = currentItems
        if (!showHidden) {
          itemsToShow = currentItems.filter(item => !item.name.startsWith('.'))
        }

        if (hasLongFlag) {
          ctx.addLine('output', `total ${itemsToShow.length}`)
          itemsToShow.forEach(item => {
            const size = item.size ? formatFileSize(item.size).padStart(8) : '     4.0K'
            const date = item.modified?.toLocaleDateString('en-US', {
              month: 'short',
              day: '2-digit'
            }) || 'Jan 15'
            const time = item.modified?.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }) || '12:00'
            const permissions = item.permissions || (item.type === 'directory' ? 'drwxr-xr-x' : '-rw-r--r--')
            ctx.addLine('output', `${permissions} 1 yflong yflong ${size} ${date} ${time} ${item.name}`)
          })
        } else {
          const itemNames = itemsToShow.map(item =>
            item.type === 'directory' ? `${item.name}/` : item.name
          ).join('  ')
          ctx.addLine('output', itemNames)
        }
      }
      break

    case 'pwd':
      ctx.addLine('output', ctx.currentDirectory)
      break

    case 'cd':
      const targetDir = args[0]
      if (!targetDir || targetDir === '~') {
        ctx.setCurrentDirectory('/home/yflong')
        ctx.addLine('success', 'Changed to home directory')
      } else if (targetDir === '..') {
        const pathParts = ctx.currentDirectory.split('/').filter(Boolean)
        if (pathParts.length > 1) {
          pathParts.pop()
          const parentDir = '/' + pathParts.join('/')
          ctx.setCurrentDirectory(parentDir)
          ctx.addLine('success', `Changed to ${parentDir}`)
        } else {
          ctx.setCurrentDirectory('/')
          ctx.addLine('success', 'Changed to root directory')
        }
      } else if (targetDir.startsWith('/')) {
        if (fileSystem[targetDir]) {
          ctx.setCurrentDirectory(targetDir)
          ctx.addLine('success', `Changed to ${targetDir}`)
        } else {
          ctx.addLine('error', `cd: ${targetDir}: No such file or directory`)
        }
      } else {
        const newPath = ctx.currentDirectory === '/' ? `/${targetDir}` : `${ctx.currentDirectory}/${targetDir}`
        if (fileSystem[newPath]) {
          ctx.setCurrentDirectory(newPath)
          ctx.addLine('success', `Changed to ${newPath}`)
        } else {
          const currentItems = fileSystem[ctx.currentDirectory] || []
          const dirExists = currentItems.some(item => item.name === targetDir && item.type === 'directory')
          if (dirExists) {
            ctx.setCurrentDirectory(newPath)
            ctx.addLine('success', `Changed to ${newPath}`)
          } else {
            ctx.addLine('error', `cd: ${targetDir}: No such file or directory`)
          }
        }
      }
      break

    case 'cat':
      const filename = args[0]
      if (!filename) {
        ctx.addLine('error', 'cat: missing file operand')
      } else {
        const currentItems = fileSystem[ctx.currentDirectory] || []
        const file = currentItems.find(item => item.name === filename && item.type === 'file')
        if (file) {
          const content = fileContents[filename]
          if (content) {
            ctx.addLine('output', content)
          } else {
            ctx.addLine('output', `File contents of ${filename}...\nWelcome to yflong's secure terminal.\nYou are not authorized to view this file.\nTry 'sudo' or contact the person who own this file.`)
          }
        } else {
          ctx.addLine('error', `cat: ${filename}: No such file or directory`)
        }
      }
      break

    case 'whoami':
      ctx.addLine('output', 'Yunfeng Long')
      break

    case 'date':
      ctx.addLine('output', new Date().toString())
      break

    case 'uname':
      const hasAllFlag = args.includes('-a')
      ctx.addLine('output', hasAllFlag ? systemOutputs.unameAll : systemOutputs.uname)
      break

    case 'ps':
      ctx.addLine('output', systemOutputs.ps)
      break

    case 'top':
      ctx.addLine('output', systemOutputs.top(new Date().toLocaleTimeString()))
      break

    case 'free':
      ctx.addLine('output', systemOutputs.free)
      break

    case 'df':
      ctx.addLine('output', systemOutputs.df)
      break

    case 'uptime':
      ctx.addLine('output', systemOutputs.uptime(new Date().toLocaleTimeString()))
      break

    case 'clear':
      ctx.setLines([])
      break

    case 'history':
      ctx.commandHistory.forEach((cmd, index) => {
        ctx.addLine('output', `${(index + 1).toString().padStart(4)} ${cmd}`)
      })
      break

    case 'echo':
      ctx.addLine('output', args.join(' '))
      break

    case 'mkdir':
      const dirName = args[0]
      if (!dirName) {
        ctx.addLine('error', 'mkdir: missing operand')
      } else {
        ctx.addLine('success', `Directory '${dirName}' created successfully`)
      }
      break

    case 'touch':
      const fileName = args[0]
      if (!fileName) {
        ctx.addLine('error', 'touch: missing file operand')
      } else {
        ctx.addLine('success', `File '${fileName}' created successfully`)
      }
      break

    case 'rm':
      const rmFile = args[0]
      if (!rmFile) {
        ctx.addLine('error', 'rm: missing operand')
      } else {
        ctx.addLine('success', `File '${rmFile}' removed successfully`)
      }
      break

    case 'tree':
      ctx.addLine('output', systemOutputs.tree(ctx.currentDirectory))
      break

    case 'neofetch':
      ctx.addLine('output', systemOutputs.neofetch)
      break

    case 'exit':
      ctx.addLine('warning', 'Terminal session ended. Refresh page to restart.')
      ctx.setIsTerminalActive(false)
      setTimeout(() => {
        if (ctx.inputRef.current) {
          ctx.inputRef.current.disabled = true
        }
      }, 100)
      break

    default:
      ctx.addLine('error', `Command not found: ${cmd}. Type 'help' for available commands.`)
  }
}

