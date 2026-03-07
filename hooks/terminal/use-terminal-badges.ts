"use client"

import { useEffect, useState } from "react"
import { getCurrentIP } from "@/utils/network"

interface BadgeVisibility {
  aes: boolean
  encrypted: boolean
  ip: boolean
}

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })

export function useTerminalBadges() {
  const [currentIP, setCurrentIP] = useState("Loading...")
  const [showBadges, setShowBadges] = useState<BadgeVisibility>({
    aes: false,
    encrypted: false,
    ip: false,
  })

  useEffect(() => {
    let isCancelled = false

    const animateBadges = async () => {
      await sleep(1000)
      if (isCancelled) return
      setShowBadges((prevState) => ({ ...prevState, aes: true }))

      await sleep(300)
      if (isCancelled) return
      setShowBadges((prevState) => ({ ...prevState, encrypted: true }))

      try {
        const ip = await getCurrentIP()
        if (!isCancelled) {
          setCurrentIP(ip)
        }
      } catch {
        if (!isCancelled) {
          setCurrentIP("192.168.1.x")
        }
      }

      if (isCancelled) return
      setShowBadges((prevState) => ({ ...prevState, ip: true }))
    }

    void animateBadges()

    return () => {
      isCancelled = true
    }
  }, [])

  return {
    currentIP,
    showBadges,
  }
}
