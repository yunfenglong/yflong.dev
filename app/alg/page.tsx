import type { Metadata } from "next"
import SiteNavigation from "@/components/layout/SiteNavigation"
import SiteFooter from "@/components/layout/SiteFooter"
import AlgorithmMobileTips from "@/components/algorithms/AlgorithmMobileTips"
import AlgorithmOverview from "@/components/algorithms/AlgorithmOverview"
import { siteConfig } from "@/config/site"

export const metadata: Metadata = {
  title: "Algorithm Visualizer",
  description: "Interactive algorithms lab for replaying sorting, searching, and graph algorithms step by step.",
  alternates: {
    canonical: "/alg",
  },
  openGraph: {
    title: "Algorithm Visualizer | YFLONG.DEV",
    description: "Interactive algorithms lab for replaying sorting, searching, and graph algorithms step by step.",
    url: `${siteConfig.url}/alg`,
    siteName: siteConfig.name,
    type: "website",
  },
}

export default function AlgorithmPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteNavigation />
      <main className="flex-1 px-[5%] pt-[calc(env(safe-area-inset-top)+8rem)] pb-[7dvh] flex items-start justify-center">
        <section className="w-full max-w-[61.25rem] space-y-5 sm:space-y-6">
          <header className="space-y-3">
            <p className="aman-eyebrow">alg</p>
            <h1 className="aman-display text-3xl sm:text-4xl text-text-primary">
              Algorithms
            </h1>
            <p className="w-full max-w-3xl text-sm text-text-body leading-relaxed">
              An interactive algorithms lab I built to turn textbook ideas into replayable,
              inspectable traces. Browse the catalog, jump into a focused scenario, and open a
              dedicated visualizer page when you want the full chart, canvas, and controls.
            </p>
            <div className="flex flex-wrap items-center gap-2 text-[0.7rem] uppercase tracking-[0.14em] text-muted">
              <span>curated presets</span>
              <span className="text-[#c3b39e]">•</span>
              <span>dedicated visualizer pages</span>
              <span className="text-[#c3b39e]">•</span>
              <span>interactive walkthroughs</span>
            </div>
          </header>

          <AlgorithmMobileTips />

          <AlgorithmOverview />
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
