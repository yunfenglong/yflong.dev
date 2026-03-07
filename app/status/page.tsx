"use client"

import SiteNavigation from "@/components/layout/SiteNavigation"
import SiteFooter from "@/components/layout/SiteFooter"
import StatusDashboard from "@/components/StatusDashboard"

export default function StatusPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteNavigation />
      <main className="flex-1 px-[5%] pt-[calc(env(safe-area-inset-top)+8rem)] pb-[5dvh]">
        <StatusDashboard />
      </main>
      <SiteFooter />
    </div>
  )
}
