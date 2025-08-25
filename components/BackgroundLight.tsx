"use client"

import React, { useEffect, useState } from 'react'
import { useIsMobile } from '@/components/ui/use-mobile'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'

const BackgroundLight: React.FC = () => {
  const isMobile = useIsMobile()
  const prefersReducedMotion = usePrefersReducedMotion()
  const [lightPositions, setLightPositions] = useState({
    main: { x: 50, y: 50 },
    accent1: { x: 45, y: 40 },
    accent2: { x: 55, y: 60 },
    accent3: { x: 50, y: 50 }
  })

  // Generate random light positions periodically
  useEffect(() => {
    if (!isMobile || prefersReducedMotion) return

    const updateLightPositions = () => {
      setLightPositions({
        main: {
          x: 45 + Math.random() * 10, // 45-55%
          y: 45 + Math.random() * 10  // 45-55%
        },
        accent1: {
          x: 35 + Math.random() * 30, // 35-65%
          y: 30 + Math.random() * 40  // 30-70%
        },
        accent2: {
          x: 40 + Math.random() * 20, // 40-60%
          y: 50 + Math.random() * 20  // 50-70%
        },
        accent3: {
          x: 48 + Math.random() * 4,  // 48-52%
          y: 48 + Math.random() * 4   // 48-52%
        }
      })
    }

    // Initial random positions
    updateLightPositions()

    // Update positions every 3-7 seconds randomly
    const interval = setInterval(() => {
      updateLightPositions()
    }, 3000 + Math.random() * 4000)

    return () => clearInterval(interval)
  }, [isMobile, prefersReducedMotion])

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
      {/* Base black background */}
      <div className="absolute inset-0 bg-black" />

      {/* Mobile gradient light effect */}
      {isMobile ? (
        <div className="relative w-full h-full">
          {/* Black frame at top and bottom - attached to the light component */}
          <div className="absolute top-0 left-0 right-0 h-[5px] bg-black z-20" />
          <div className="absolute bottom-0 left-0 right-0 h-[5px] bg-black z-20" />

          {/* Main radial gradient light from center with random position */}
          <div
            className="absolute inset-0 transition-all duration-[3000ms] ease-in-out"
            style={{
              background: `
                radial-gradient(
                  ellipse 80% 60% at ${lightPositions.main.x}% ${lightPositions.main.y}%,
                  rgba(148, 163, 184, 0.18) 0%,
                  rgba(148, 163, 184, 0.12) 20%,
                  rgba(148, 163, 184, 0.06) 40%,
                  rgba(0, 0, 0, 0.7) 70%,
                  rgba(0, 0, 0, 1) 100%
                )
              `,
              animation: 'pulse-light 5s ease-in-out infinite alternate'
            }}
          />

          {/* Additional random light spots with dynamic positions */}
          <div
            className="absolute inset-0 transition-all duration-[4000ms] ease-in-out"
            style={{
              background: `
                radial-gradient(
                  circle 40% at ${lightPositions.accent1.x}% ${lightPositions.accent1.y}%,
                  rgba(59, 130, 246, 0.1) 0%,
                  rgba(59, 130, 246, 0.04) 30%,
                  transparent 50%
                ),
                radial-gradient(
                  circle 35% at ${lightPositions.accent2.x}% ${lightPositions.accent2.y}%,
                  rgba(139, 92, 246, 0.08) 0%,
                  rgba(139, 92, 246, 0.03) 25%,
                  transparent 45%
                ),
                radial-gradient(
                  circle 60% at ${lightPositions.accent3.x}% ${lightPositions.accent3.y}%,
                  rgba(255, 255, 255, 0.04) 0%,
                  rgba(255, 255, 255, 0.01) 40%,
                  transparent 70%
                )
              `,
              animation: 'shimmer-light 7s ease-in-out infinite alternate-reverse'
            }}
          />
        </div>
      ) : (
        /* Desktop gradient - keep existing style */
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #000000 0%, #1f2937 50%, #000000 100%)'
          }}
        />
      )}
    </div>
  )
}

export default BackgroundLight
