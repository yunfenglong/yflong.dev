"use client"

import SiteNavigation from "@/components/layout/SiteNavigation"
import StatusDashboard from "@/components/StatusDashboard"

export default function StatusPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNavigation page="status" />
      <main className="min-h-screen p-4 sm:p-6 lg:p-8 pt-28 sm:pt-32">
        <StatusDashboard />
      </main>
    </div>
  )
}
