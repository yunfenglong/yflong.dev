import type { Metadata } from "next"
import SiteNavigation from "@/components/layout/SiteNavigation"
import SiteFooter from "@/components/layout/SiteFooter"
import AlgorithmVisualizer from "@/components/algorithms/AlgorithmVisualizer"
import { siteConfig } from "@/config/site"

export const metadata: Metadata = {
  title: "Algorithms",
  description: "Interactive route for replaying core algorithms step by step.",
  alternates: {
    canonical: "/alg",
  },
  openGraph: {
    title: "Algorithm Visualizer | YFLONG.DEV",
    description: "Interactive route for replaying core algorithms step by step.",
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
          <header className="swift-surface-strong rounded-lg p-6 sm:p-8 space-y-3">
            <p className="text-[0.6875rem] uppercase tracking-[0.14em] text-[#8f8475]">alg</p>
            <h1 className="aman-display text-[1.9rem] sm:text-[2.25rem] leading-none text-[#3b342c]">
              Algorithms
            </h1>
            <p className="w-full max-w-3xl text-sm sm:text-[0.95rem] leading-relaxed text-[#554b3e]">
              A small learning lab for replaying algorithms I&apos;ve already studied. Pick an
              algorithm, step through each state, and watch how the idea unfolds over time.
            </p>
            <div className="flex flex-wrap items-center gap-2 text-[0.7rem] uppercase tracking-[0.14em] text-[#8f8475]">
              <span>interactive walkthroughs</span>
              <span className="text-[#c3b39e]">•</span>
              <span>sorting and searching</span>
              <span className="text-[#c3b39e]">•</span>
              <span>learning-focused design</span>
            </div>
          </header>

          <section className="swift-surface rounded-lg p-5 sm:hidden">
            <div className="flex items-center gap-4">
              <div className="flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center rounded-full border border-[#d7ccbc] bg-[#f8f2e8]">
                <div
                  aria-hidden="true"
                  className="mobile-rotate-device flex h-11 w-7 items-center justify-center rounded-[0.95rem] border border-[#c6ae8d] bg-[#f1e3cd] shadow-[0_0.7rem_1.25rem_-0.9rem_rgba(30,24,17,0.45)]"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#9b7f5a]" />
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-[0.68rem] uppercase tracking-[0.14em] text-[#8f8475]">
                  best mobile view
                </p>
                <p className="text-sm leading-relaxed text-[#4f4538]">
                  Rotate your phone for more horizontal space while stepping through the chart.
                </p>
                <p className="text-sm leading-relaxed text-[#5f5446]">
                  Tablet or desktop gives the best experience for the full visualizer layout.
                </p>
              </div>
            </div>
          </section>

          <AlgorithmVisualizer />
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
