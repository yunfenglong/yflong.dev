import type { Metadata } from "next"
import SiteNavigation from "@/components/layout/SiteNavigation"
import SiteFooter from "@/components/layout/SiteFooter"
import StatusDashboard from "@/components/StatusDashboard"
import { siteConfig } from "@/config/site"

export const metadata: Metadata = {
  title: "System Status",
  description: "Real-time uptime and incident tracking for yflong.dev infrastructure.",
  alternates: {
    canonical: "/status",
  },
  openGraph: {
    title: "System Status | YFLONG.DEV",
    description: "Real-time uptime and incident tracking for yflong.dev infrastructure.",
    url: `${siteConfig.url}/status`,
    siteName: siteConfig.name,
    type: "website",
  },
}

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
