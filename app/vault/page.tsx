import type { Metadata } from "next"
import SiteNavigation from "@/components/layout/SiteNavigation"
import SiteFooter from "@/components/layout/SiteFooter"
import VaultContent from "@/components/vault/VaultContent"
import { siteConfig } from "@/config/site"

export const metadata: Metadata = {
  title: "CTF Vault",
  description: "Secure terminal capture the flag vault. Recover the broken routes to gain access.",
  alternates: {
    canonical: "/vault",
  },
  openGraph: {
    title: "CTF Vault | YFLONG.DEV",
    description: "Secure terminal capture the flag vault. Recover the broken routes to gain access.",
    url: `${siteConfig.url}/vault`,
    siteName: siteConfig.name,
    type: "website",
  },
}

export default function VaultPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteNavigation />
      <main className="flex-1 px-[5%] pt-[calc(env(safe-area-inset-top)+8rem)] pb-[7dvh] flex items-start justify-center">
        <VaultContent />
      </main>
      <SiteFooter />
    </div>
  )
}
