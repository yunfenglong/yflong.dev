"use client"

import SceneLayout from "@/components/layout/SceneLayout"
import SiteNavigation from "@/components/layout/SiteNavigation"
import StatusDashboard from "@/components/StatusDashboard"

export default function StatusPage() {
  return (
    <SceneLayout
      contentClassName="min-h-screen p-4 sm:p-6 lg:p-8"
      navigation={<SiteNavigation page="status" />}
    >
      <StatusDashboard />
    </SceneLayout>
  )
}
