"use client"

import SiteNavigation from "@/components/layout/SiteNavigation"
import SiteFooter from "@/components/layout/SiteFooter"
import NativeTerminal from "@/components/NativeTerminal"
import { ctfSourceToken } from "@/config/ctf"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteNavigation />
      <main
        data-ctf-token={ctfSourceToken}
        className="flex-1 flex items-start justify-center px-[5%] pt-[calc(env(safe-area-inset-top)+8rem)] pb-[5dvh]"
      >
        <NativeTerminal />
      </main>
      <SiteFooter />
    </div>
  )
}
