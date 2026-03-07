"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import BackgroundLight from "@/components/BackgroundLight"
import CyberGrid from "@/components/CyberGrid"

interface SceneLayoutProps {
  children: ReactNode
  contentClassName: string
  navigation: ReactNode
  overlay?: ReactNode
}

export default function SceneLayout({
  children,
  contentClassName,
  navigation,
  overlay,
}: SceneLayoutProps) {
  return (
    <div className="min-h-screen text-white font-mono overflow-hidden relative">
      <BackgroundLight />
      <CyberGrid />

      <motion.div
        className={`relative z-20 ${contentClassName}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {children}
      </motion.div>

      {overlay}
      {navigation}
    </div>
  )
}
