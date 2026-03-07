"use client"

import SceneLayout from "@/components/layout/SceneLayout"
import SiteNavigation from "@/components/layout/SiteNavigation"
import NativeTerminal from "@/components/NativeTerminal"

export default function PaperShaderPage() {
  return (
    <SceneLayout
      contentClassName="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8"
      navigation={<SiteNavigation page="home" />}
      overlay={
        <div className="fixed inset-0 pointer-events-none z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/[0.005] rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/[0.005] rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "3s" }}
          />
        </div>
      }
    >
      <NativeTerminal />
    </SceneLayout>
  )
}
