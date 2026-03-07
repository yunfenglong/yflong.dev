"use client"

import SiteNavigation from "@/components/layout/SiteNavigation"
import StatusDashboard from "@/components/StatusDashboard"

export default function StatusPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNavigation page="status" />
      <main className="min-h-screen px-[5%] pt-[calc(env(safe-area-inset-top)+8rem)] pb-[5dvh]">
        <StatusDashboard />
      </main>
    </div>
  )
}
