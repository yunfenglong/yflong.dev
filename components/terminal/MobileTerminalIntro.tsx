"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Code2, Cpu, Database, Zap } from "lucide-react"

const DISPLAY_NAME = "Yunfeng Long"

export default function MobileTerminalIntro() {
  const [typedName, setTypedName] = useState("")
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    let currentIndex = 0
    const typingInterval = setInterval(() => {
      if (currentIndex <= DISPLAY_NAME.length) {
        setTypedName(DISPLAY_NAME.slice(0, currentIndex))
        currentIndex += 1
        return
      }
      clearInterval(typingInterval)
      setTimeout(() => {
        setShowContent(true)
      }, 500)
    }, 100)

    return () => clearInterval(typingInterval)
  }, [])

  return (
    <div className="w-full max-w-md mx-auto px-6 py-8">
      <div className="text-left space-y-3 text-white/80 font-mono text-sm leading-relaxed">
        <motion.div
          className="text-lg font-bold mb-2"
          initial={{ marginBottom: "0.5rem", y: 0 }}
          animate={{
            marginBottom: showContent ? "0.75rem" : "0.5rem",
            y: showContent ? -10 : 0,
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <span className="font-bold">{typedName}</span>
          {typedName.length < DISPLAY_NAME.length && (
            <span className="animate-pulse">|</span>
          )}
        </motion.div>

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
              • Second-year student at{" "}
              <span className="font-bold">Monash University</span>
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
  )
}
