import type { Metadata } from "next"
import SiteNavigation from "@/components/layout/SiteNavigation"
import SiteFooter from "@/components/layout/SiteFooter"
import { contactMethods, profileConfig } from "@/config/profile"
import { siteConfig } from "@/config/site"

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Yunfeng Long for internship, project, and collaboration opportunities.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact | YFLONG.DEV",
    description: "Contact Yunfeng Long for internship, project, and collaboration opportunities.",
    url: `${siteConfig.url}/contact`,
    siteName: siteConfig.name,
    type: "website",
  },
}

export default function ContactPage() {
  const templateSubject = "Internship opportunity - [Company Name]"
  const templateBody = [
    "Hi Yunfeng,",
    "",
    "I am reaching out regarding an internship opportunity at [Company Name].",
    "",
    "Role Description: [Add role description]",
    "Expected Start Period: [Add expected start period]",
    "Preferred Contact Method: [Add preferred contact method]",
    "",
    "Best regards,",
    "[Your Name]",
  ].join("\n")
  const templateHref = `mailto:${profileConfig.email}?subject=${encodeURIComponent(templateSubject)}&body=${encodeURIComponent(templateBody)}`

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteNavigation />
      <main className="flex-1 px-[5%] pt-[calc(env(safe-area-inset-top)+8rem)] pb-[7dvh] flex items-start justify-center">
        <section className="w-full max-w-[45.9375rem] space-y-5 sm:space-y-6">
          <header className="swift-surface-strong rounded-lg p-6 sm:p-8 space-y-3">
            <p className="text-[0.6875rem] uppercase tracking-[0.14em] text-[#8f8475]">contact</p>
            <h1 className="aman-display text-[1.8rem] sm:text-[2.2rem] leading-none text-[#3b342c]">
              Let&apos;s Build Something Useful
            </h1>
            <p className="text-sm text-[#5f5446] leading-relaxed">
              Open to internship opportunities, software engineering collaborations, and technical
              project discussions.
            </p>
            <div className="flex flex-wrap items-center gap-2 text-[0.67rem] uppercase tracking-[0.14em] text-[#8f8475]">
              <span>{profileConfig.targetRole}</span>
              <span className="text-[#c3b39e]">•</span>
              <span>{profileConfig.location}</span>
              <span className="text-[#c3b39e]">•</span>
              <span>{profileConfig.timezone}</span>
            </div>
          </header>

          <section className="swift-surface rounded-lg p-6 sm:p-8 space-y-3">
            <h2 className="text-[0.7rem] uppercase tracking-[0.14em] text-[#8f8475]">contact channels</h2>
            <div className="space-y-2">
              {contactMethods.map((method) => (
                <a
                  key={method.id}
                  href={method.href}
                  target={method.href.startsWith("http") ? "_blank" : undefined}
                  rel={method.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="flex items-center justify-between gap-3 rounded-md border border-[#d7ccbc] bg-[#f7f2e9] px-3 py-2.5 hover:bg-[#efe7db] transition-colors"
                >
                  <span className="text-[0.66rem] uppercase tracking-[0.12em] text-[#8f8475]">
                    {method.label}
                  </span>
                  <span className="text-sm text-[#4f4538]">{method.value}</span>
                </a>
              ))}
            </div>
          </section>

          <section className="swift-surface rounded-lg p-6 sm:p-8 space-y-2">
            <h2>
              <a
                href={templateHref}
                className="text-[0.7rem] uppercase tracking-[0.14em] text-[#8f8475] underline-offset-4 hover:underline focus-visible:underline"
              >
                message template
              </a>
            </h2>
            <p className="text-sm text-[#4f4538] leading-relaxed">
              Subject: Internship opportunity - [Company Name]
            </p>
            <p className="text-sm text-[#4f4538] leading-relaxed">
              Include role description, expected start period, and preferred contact method.
            </p>
          </section>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
