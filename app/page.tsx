"use client"

import SiteNavigation from "@/components/layout/SiteNavigation"
import NativeTerminal from "@/components/NativeTerminal"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNavigation page="home" />
      <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 pt-28 sm:pt-32">
        <NativeTerminal />
      </main>
    </div>
  )
}
