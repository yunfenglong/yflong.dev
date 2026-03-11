import type { Metadata } from "next"
import { notFound } from "next/navigation"
import SiteNavigation from "@/components/layout/SiteNavigation"
import SiteFooter from "@/components/layout/SiteFooter"
import AlgorithmVisualizer from "@/components/algorithms/AlgorithmVisualizer"
import { algorithmCatalog, algorithmCatalogById } from "@/config/algorithms"
import { siteConfig } from "@/config/site"

interface AlgorithmDetailPageProps {
  params: Promise<{ algorithmId: string }>
}

export const dynamicParams = false

export async function generateStaticParams() {
  return algorithmCatalog.map((algorithm) => ({ algorithmId: algorithm.id }))
}

export async function generateMetadata({ params }: AlgorithmDetailPageProps): Promise<Metadata> {
  const { algorithmId } = await params
  const algorithm = algorithmCatalogById[algorithmId]

  if (!algorithm) {
    return {
      title: "Algorithm Not Found",
    }
  }

  return {
    title: `${algorithm.name} Visualizer`,
    description: algorithm.description,
    alternates: {
      canonical: `/alg/${algorithm.id}`,
    },
    openGraph: {
      title: `${algorithm.name} Visualizer | ${siteConfig.name}`,
      description: algorithm.description,
      url: `${siteConfig.url}/alg/${algorithm.id}`,
      siteName: siteConfig.name,
      type: "website",
    },
  }
}

export default async function AlgorithmDetailPage({ params }: AlgorithmDetailPageProps) {
  const { algorithmId } = await params
  const algorithm = algorithmCatalogById[algorithmId]

  if (!algorithm) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteNavigation />
      <main className="flex-1 px-[5%] pt-[calc(env(safe-area-inset-top)+8rem)] pb-[7dvh] flex items-start justify-center">
        <section className="w-full max-w-[61.25rem] space-y-5 sm:space-y-6">
          <AlgorithmVisualizer initialAlgorithmId={algorithm.id} />
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
