import type React from "react"
import type { Metadata } from "next"
import { profileConfig } from "@/config/profile"
import { siteConfig } from "@/config/site"
import "./globals.css"

const personStructuredData = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profileConfig.name,
  jobTitle: profileConfig.targetRole,
  url: siteConfig.url,
  alumniOf: profileConfig.university,
  email: profileConfig.email,
  sameAs: [profileConfig.linkedin, profileConfig.github],
}

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  alternates: {
    canonical: "/",
  },
  applicationName: siteConfig.name,
  keywords: [
    "computer science student",
    "software engineer portfolio",
    "next.js portfolio",
    "typescript",
    "web engineering",
  ],
  authors: [{ name: profileConfig.name, url: siteConfig.url }],
  creator: profileConfig.name,
  generator: "Next.js",
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: siteConfig.name,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personStructuredData) }}
        />
        {children}
      </body>
    </html>
  )
}
