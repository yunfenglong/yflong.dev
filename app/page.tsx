import type { Metadata } from "next"
import SiteNavigation from "@/components/layout/SiteNavigation"
import SiteFooter from "@/components/layout/SiteFooter"
import NativeTerminal from "@/components/NativeTerminal"
import { ctfSourceToken } from "@/config/ctf"
import { siteConfig } from "@/config/site"

export const metadata: Metadata = {
  title: "Terminal | Yunfeng Long",
  description: "Interactive terminal portfolio of Yunfeng Long.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Terminal | Yunfeng Long",
    description: "Interactive terminal portfolio of Yunfeng Long.",
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
  },
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteNavigation />
      <main
        data-layout-main
        data-ctf-token={ctfSourceToken}
        className="flex-1 flex items-start justify-center px-[5%] pt-[calc(env(safe-area-inset-top)+8rem)] pb-[2dvh]"
      >
        <NativeTerminal />
      </main>
      <SiteFooter />
    </div>
  )
}
