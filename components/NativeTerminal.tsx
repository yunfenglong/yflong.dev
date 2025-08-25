import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, Shield, Lock, Code2, Database, Cpu, Zap } from 'lucide-react';
import { TerminalLine } from '@/types/terminal';
import { bootMessages, availableCommands } from '@/config/terminal';
import { runCommand } from '@/lib/terminal/commands';
import { getCurrentIP } from '@/utils/network';

const NativeTerminal: React.FC = () => {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentDirectory, setCurrentDirectory] = useState('/home/yflong');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showCursor, setShowCursor] = useState(true);
  const [isTerminalActive, setIsTerminalActive] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isBooting, setIsBooting] = useState(true);
  const [currentIP, setCurrentIP] = useState<string>('Loading...');
  const [isMobile, setIsMobile] = useState(false);
  const [showBadges, setShowBadges] = useState({ aes: false, encrypted: false, ip: false });
  const [typedName, setTypedName] = useState('');
  const [showContent, setShowContent] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lineIdRef = useRef(0);
  const bootSequenceStarted = useRef(false);

  // Cursor blinking effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // Use lg breakpoint for better terminal experience
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Badge animation sequence (right to left)
  useEffect(() => {
    const animateBadges = async () => {
      // Wait for initial load
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Show AES badge first (rightmost)
      setShowBadges(prev => ({ ...prev, aes: true }));
      await new Promise(resolve => setTimeout(resolve, 300));

      // Show ENCRYPTED badge second (middle)
      setShowBadges(prev => ({ ...prev, encrypted: true }));
      await new Promise(resolve => setTimeout(resolve, 300));

      // Fetch IP and show IP badge last (leftmost)
      try {
        const ip = await getCurrentIP();
        setCurrentIP(ip);
      } catch {
        setCurrentIP('192.168.1.x');
      }

      setShowBadges(prev => ({ ...prev, ip: true }));
    };

    animateBadges();
  }, []);

  // Typing animation for mobile name
  useEffect(() => {
    if (isMobile) {
      const name = 'Yunfeng Long';
      let currentIndex = 0;

      const typeInterval = setInterval(() => {
        if (currentIndex <= name.length) {
          setTypedName(name.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(typeInterval);
          // Show content after typing is complete
          setTimeout(() => {
            setShowContent(true);
          }, 500);
        }
      }, 100); // 100ms per character

      return () => clearInterval(typeInterval);
    }
  }, [isMobile]);

  const addLine = useCallback((type: TerminalLine['type'], content: string) => {
    const newLine: TerminalLine = {
      id: lineIdRef.current++,
      type,
      content,
      timestamp: new Date(),
    };
    setLines(prev => [...prev, newLine]);
  }, []);

  const executeCommand = useCallback((command: string) => {
    const trimmedCommand = command.trim();
    if (!trimmedCommand) return;

    // Add command to history
    setCommandHistory(prev => {
      const newHistory = [...prev, trimmedCommand];
      return newHistory.slice(-100); // Keep last 100 commands
    });
    setHistoryIndex(-1);

    // Add input line
    addLine('input', trimmedCommand);

    const [cmd, ...args] = trimmedCommand.split(' ');

    runCommand(cmd.toLowerCase(), args, {
      currentDirectory,
      setCurrentDirectory,
      addLine,
      commandHistory,
      setLines,
      setIsTerminalActive,
      inputRef,
    });
  }, [addLine, commandHistory, currentDirectory, setCurrentDirectory, setLines, setIsTerminalActive]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isTerminalActive || isBooting) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      executeCommand(currentInput);
      setCurrentInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCurrentInput('');
        } else {
          setHistoryIndex(newIndex);
          setCurrentInput(commandHistory[newIndex]);
        }
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const currentCmd = currentInput.toLowerCase();
      const matches = availableCommands.filter(cmd => cmd.startsWith(currentCmd));

      if (matches.length === 1) {
        setCurrentInput(matches[0]);
      } else if (matches.length > 1) {
        addLine('output', matches.join('  '));
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  // Boot sequence with authentication simulation
  useEffect(() => {
    if (!hasInitialized && isBooting && !bootSequenceStarted.current) {
      bootSequenceStarted.current = true;

      const bootSequence = async () => {
        // Wait 2 seconds after terminal appears
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Start boot sequence
        for (const message of bootMessages) {
          await new Promise(resolve => setTimeout(resolve, message.delay));

          setLines(prevLines => [...prevLines, {
            id: lineIdRef.current++,
            type: message.content.includes('successful') || message.content.includes('established') || message.content.includes('active')
              ? 'success' as const
              : message.content.includes('Welcome')
                ? 'output' as const
                : 'output' as const,
            content: message.content,
            timestamp: new Date(),
          }]);
        }

        // Start clearing messages 1 second before input appears
        await new Promise(resolve => setTimeout(resolve, 500));

        // Animate messages disappearing one by one (reverse order)
        const currentLines = [...bootMessages];
        for (let i = currentLines.length - 1; i >= 0; i--) {
          setLines(prevLines => prevLines.slice(0, -1));
          await new Promise(resolve => setTimeout(resolve, 80));
        }

        // Wait additional 0.5 seconds after all messages disappear before showing input
        await new Promise(resolve => setTimeout(resolve, 500));

        setIsBooting(false);
        setHasInitialized(true);
      };

      bootSequence();
    }
  }, [hasInitialized, isBooting]);

  useEffect(() => {
    // Focus input when component mounts and on click
    const focusInput = () => {
      if (inputRef.current && !inputRef.current.disabled && isTerminalActive && !isBooting) {
        inputRef.current.focus();
      }
    };

    focusInput();
    document.addEventListener('click', focusInput);

    return () => {
      document.removeEventListener('click', focusInput);
    };
  }, [isTerminalActive, isBooting]);



  // Mobile version
  if (isMobile) {
    return (
      <div className="w-full max-w-md mx-auto px-6 py-8">
        <div className="text-left space-y-3 text-white/80 font-mono text-sm leading-relaxed">
          {/* Typing name animation */}
          <motion.div
            className="text-lg font-bold mb-2"
            initial={{ marginBottom: '0.5rem', y: 0 }}
            animate={{
              marginBottom: showContent ? '0.75rem' : '0.5rem',
              y: showContent ? -10 : 0
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <span className="font-bold">{typedName}</span>
            {typedName.length < 'Yunfeng Long'.length && (
              <span className="animate-pulse">|</span>
            )}
          </motion.div>

          {/* Content appears after typing is complete */}
          {showContent && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
              className="space-y-3"
            >
              <motion.div
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2, ease: "easeOut" }}
              >
                • Second-year student at <span className="font-bold">Monash University</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.25, ease: "easeOut" }}
              >
                • Front-end development, automation, web technologies
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3, ease: "easeOut" }}
                className="flex items-center gap-1 flex-wrap"
              >
                •
                <Code2 className="w-3 h-3 text-blue-400 ml-1" />
                React,
                <Cpu className="w-3 h-3 text-blue-500" />
                TypeScript
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.35, ease: "easeOut" }}
                className="flex items-center gap-1 flex-wrap"
              >
                <Database className="ml-4 w-2.5 h-2.5 text-green-400" />
                Next.js,
                <Zap className="w-3 h-3 text-yellow-400" />
                ML Integration
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4, ease: "easeOut" }}
              >
                • Focus on modern web development practices
              </motion.div>

              

              <motion.div
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.45, ease: "easeOut" }}
                className="pt-4 text-white/60 text-xs"
              >
                Please visit on a larger screen for interactive terminal
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      {/* Main Terminal Window */}
      <motion.div
        className="glass-panel rounded-xl overflow-hidden"
        initial={{ y: 20, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Terminal Header - Minimal Design */}
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
              animate={{ opacity: showBadges.encrypted ? 1 : 0, x: showBadges.encrypted ? 0 : 20 }}
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

        {/* Terminal Content */}
        <div className="p-6 min-h-[500px] max-h-[600px] overflow-y-auto font-mono text-sm leading-relaxed text-white cursor-text scrollbar-hide"
             ref={terminalRef}
             onClick={() => inputRef.current?.focus()}>
          {/* Terminal Lines */}
          <div className="space-y-1">
            <AnimatePresence>
              {lines.map((line) => (
                <motion.div
                  key={line.id}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className={`terminal-line ${
                    line.type === 'input' ? 'text-white' :
                    line.type === 'error' ? 'terminal-error' :
                    line.type === 'success' ? 'terminal-success' :
                    line.type === 'warning' ? 'terminal-warning' :
                    'terminal-output'
                  }`}
                >
                  {line.type === 'input' ? (
                    <div className="flex items-start">
                      <span className="terminal-prompt flex-shrink-0 text-blue-600">{currentDirectory} $</span>
                      <span className="font-mono ml-2">{line.content}</span>
                    </div>
                  ) : (
                    <pre className="font-mono whitespace-pre-wrap leading-relaxed">{line.content}</pre>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Current Input Line */}
          {isTerminalActive && !isBooting && (
            <div className="terminal-line mt-4">
              <div className="flex items-center">
                <span className="terminal-prompt flex-shrink-0 text-blue-600">{currentDirectory} $</span>
                <div className="flex items-center ml-2 relative">
                  <span className="font-mono text-white">{currentInput}</span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyDown={handleKeyDown}
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
  );
};

export default NativeTerminal;
