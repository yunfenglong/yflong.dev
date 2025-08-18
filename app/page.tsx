"use client"

import { useState, useEffect } from "react"
import { MeshGradient, DotOrbit } from "@paper-design/shaders-react"

export default function PaperShaderPage() {
  const [intensity, setIntensity] = useState(1.5)
  const [speed, setSpeed] = useState(1.0)
  const [isInteracting, setIsInteracting] = useState(false)
  const [activeEffect, setActiveEffect] = useState("mesh")
  const [copied, setCopied] = useState(false)
  const [showBlackOverlay, setShowBlackOverlay] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBlackOverlay(true)
      setTimeout(() => {
        window.location.href = "https://blog.wanfung.me"
      }, 3000)
    }, 15000)

    return () => clearTimeout(timer)
  }, [])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText("pnpm i v0-cli")
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  return (
    <div className="w-full bg-black">
      <div className="relative w-full h-[120vh]">
        <div
          className={`absolute inset-0 bg-black z-50 transition-opacity duration-[3000ms] ${
            showBlackOverlay ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        />

        {activeEffect === "mesh" && (
          <MeshGradient
            className="w-full h-full absolute inset-0"
            colors={["#000000", "#1a1a1a", "#333333", "#ffffff"]}
            speed={speed}
            backgroundColor="#000000"
          />
        )}

        {activeEffect === "dots" && (
          <div className="w-full h-full absolute inset-0 bg-black">
            <DotOrbit
              className="w-full h-full"
              dotColor="#333333"
              orbitColor="#1a1a1a"
              speed={speed}
              intensity={intensity}
            />
          </div>
        )}

        {activeEffect === "combined" && (
          <>
            <MeshGradient
              className="w-full h-full absolute inset-0"
              colors={["#000000", "#1a1a1a", "#333333", "#ffffff"]}
              speed={speed * 0.5}
              wireframe="true"
              backgroundColor="#000000"
            />
            <div className="w-full h-full absolute inset-0 opacity-60">
              <DotOrbit
                className="w-full h-full"
                dotColor="#333333"
                orbitColor="#1a1a1a"
                speed={speed * 1.5}
                intensity={intensity * 0.8}
              />
            </div>
          </>
        )}

        {/* Lighting overlay effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/4 left-1/3 w-32 h-32 bg-gray-800/5 rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: `${3 / speed}s` }}
          />
          <div
            className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-white/2 rounded-full blur-2xl animate-pulse"
            style={{ animationDuration: `${2 / speed}s`, animationDelay: "1s" }}
          />
          <div
            className="absolute top-1/2 right-1/3 w-20 h-20 bg-gray-900/3 rounded-full blur-xl animate-pulse"
            style={{ animationDuration: `${4 / speed}s`, animationDelay: "0.5s" }}
          />
        </div>
      </div>

      {/* ---- FIXED UI OVERLAY ---- */}
      {/* This container is fixed to the viewport and does not scroll. */}
      {/* It holds the nav, central text, and any other UI controls. */}
      {/* 'pointer-events-none' lets clicks pass through to the background unless an element inside */}
      {/* explicitly has 'pointer-events-auto'. */}
      <div className="fixed inset-0 z-10 pointer-events-none">
        <nav className="absolute top-0 left-0 right-0 z-10 pointer-events-auto">
          <div className="flex justify-end items-center px-8 py-6">
            <div className="flex items-center space-x-8 font-mono text-sm text-white/80 hover:text-white transition-colors">
              {/* <a href="#" className="hover:text-white transition-colors">
                docs
              </a> */}
              <a href="https://github.com/yunfenglong/wanfung.me/blob/main/CHANGELOG.md" className="hover:text-white transition-colors">
                changelogs
              </a>
              <a href="https://blog.wanfung.me" className="hover:text-white transition-colors">
                blogs
              </a>
              <a
                href="https://github.com/yunfenglong/wanfung.me"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="opacity-80 hover:opacity-100 transition-opacity"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
            </div>
          </div>
        </nav>

        {/* UI Overlay Elements */}
        <div className="absolute inset-0">
          {/* Header */}
          <div className="absolute top-8 left-8 pointer-events-auto"></div>

          {/* Effect Controls */}
          <div className="absolute bottom-8 left-8 pointer-events-auto"></div>

          {/* Parameter Controls */}
          <div className="absolute bottom-8 right-8 pointer-events-auto space-y-4"></div>

          {/* Status indicator */}
          <div className="absolute top-8 right-8 pointer-events-auto"></div>
        </div>

        {/* Central Text Block */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center items-center font-mono text-xs text-white/40">
            <div>...This main site is under construction...</div>
            <div>You may visit blog site by</div>
            <div className="mt-1 flex items-center justify-center gap-2">
              <span>blog.wanfung.me</span>
              <button
                onClick={copyToClipboard}
                className="pointer-events-auto opacity-30 hover:opacity-60 transition-opacity text-white/60 hover:text-white/80"
                title="Copy to clipboard"
              >
                {copied ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
