"use client"

import SiteNavigation from "@/components/layout/SiteNavigation"
import SiteFooter from "@/components/layout/SiteFooter"

const lastUpdated = "March 7, 2026"

const browserStorageItems = [
  {
    keyName: "sessionStorage:yflong_terminal_session",
    purpose: "Stores a temporary session code so the terminal boot animation can be skipped.",
    retention: "Up to 2 hours, scoped to the current browser tab/session.",
  },
  {
    keyName: "localStorage:yflong:ctf:unlocked:v1",
    purpose: "Remembers whether the CTF vault has been unlocked.",
    retention: "Persists until you clear site data in your browser.",
  },
]

const providerNotes = [
  {
    title: "Hosting and content delivery",
    detail:
      "Infrastructure providers may process technical request metadata (for example IP address, user-agent, and request timestamps) to deliver and secure the site.",
  },
  {
    title: "External links",
    detail:
      "Links to third-party services (such as GitHub, LinkedIn, and blog properties) are controlled by those services once you leave this site.",
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteNavigation />
      <main className="flex-1 px-[5%] pt-[calc(env(safe-area-inset-top)+8rem)] pb-[7dvh] flex items-start justify-center">
        <article className="w-full max-w-[45.9375rem] swift-surface-strong rounded-lg p-6 sm:p-8 space-y-6">
          <header className="space-y-2">
            <p className="text-[0.6875rem] uppercase tracking-[0.14em] text-[#8f8475]">
              privacy
            </p>
            <h1 className="aman-display text-[1.7rem] leading-none text-[#3b342c]">
              Privacy Notice
            </h1>
            <p className="text-sm text-[#5f5446]">Last updated: {lastUpdated}</p>
          </header>

          <section className="space-y-2">
            <h2 className="text-xs uppercase tracking-[0.14em] text-[#8f8475]">Overview</h2>
            <p className="text-sm text-[#4f4538] leading-relaxed">
              This notice describes what data may be processed when you use yflong.dev, why it is
              processed, and what control you have. This site is a personal portfolio and does not
              use ad-tech profiling or data broker integrations.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xs uppercase tracking-[0.14em] text-[#8f8475]">What Data Is Used</h2>
            <p className="text-sm text-[#4f4538] leading-relaxed">
              Data used by this site is limited to:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-[#4f4538] leading-relaxed">
              <li>Technical request data needed to load and protect the site.</li>
              <li>Browser-side storage keys used for core interactive features.</li>
              <li>Information you choose to share with third-party services you open from this site.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-xs uppercase tracking-[0.14em] text-[#8f8475]">
              Browser Storage Keys
            </h2>
            <p className="text-sm text-[#4f4538] leading-relaxed">
              The following keys may be stored in your browser for functional behavior:
            </p>
            <div className="space-y-2">
              {browserStorageItems.map((item) => (
                <div
                  key={item.keyName}
                  className="rounded-md border border-[#d7ccbc] bg-[#f7f2e9] p-3"
                >
                  <p className="font-mono text-[0.72rem] text-[#4f4538]">{item.keyName}</p>
                  <p className="mt-1 text-sm text-[#4f4538]">{item.purpose}</p>
                  <p className="mt-1 text-[0.74rem] text-[#6f6558]">Retention: {item.retention}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-xs uppercase tracking-[0.14em] text-[#8f8475]">
              Why Data Is Processed
            </h2>
            <ul className="list-disc pl-5 space-y-1 text-sm text-[#4f4538] leading-relaxed">
              <li>Deliver site content and keep core UI features working.</li>
              <li>Remember feature state (for example animation skip window and CTF unlock state).</li>
              <li>Maintain service reliability and security.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-xs uppercase tracking-[0.14em] text-[#8f8475]">
              Data Sharing and Providers
            </h2>
            <div className="space-y-2">
              {providerNotes.map((item) => (
                <div key={item.title} className="rounded-md border border-[#d7ccbc] bg-[#f7f2e9] p-3">
                  <p className="text-[0.7rem] uppercase tracking-[0.14em] text-[#8f8475]">
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm text-[#4f4538] leading-relaxed">{item.detail}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-xs uppercase tracking-[0.14em] text-[#8f8475]">
              Cookies and Tracking
            </h2>
            <p className="text-sm text-[#4f4538] leading-relaxed">
              This site does not currently use marketing cookies or cross-site advertising trackers.
              If that changes in the future, this notice will be updated.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xs uppercase tracking-[0.14em] text-[#8f8475]">
              Security and Retention
            </h2>
            <p className="text-sm text-[#4f4538] leading-relaxed">
              Reasonable technical and organizational steps are used to protect site operations.
              Storage duration is limited to functional needs, and you can clear browser data at any
              time.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xs uppercase tracking-[0.14em] text-[#8f8475]">
              Your Choices and Rights
            </h2>
            <ul className="list-disc pl-5 space-y-1 text-sm text-[#4f4538] leading-relaxed">
              <li>Clear or block browser storage from your browser settings.</li>
              <li>Choose not to open third-party links from this site.</li>
              <li>Request information or raise privacy concerns by email.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-xs uppercase tracking-[0.14em] text-[#8f8475]">
              International Visitors
            </h2>
            <p className="text-sm text-[#4f4538] leading-relaxed">
              If you access this site from outside the country where infrastructure is operated,
              your information may be processed in other jurisdictions.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xs uppercase tracking-[0.14em] text-[#8f8475]">
              Children&apos;s Privacy
            </h2>
            <p className="text-sm text-[#4f4538] leading-relaxed">
              This site is not directed to children under 13, and no intentional collection of
              personal data from children is intended.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xs uppercase tracking-[0.14em] text-[#8f8475]">
              Changes to This Notice
            </h2>
            <p className="text-sm text-[#4f4538] leading-relaxed">
              This notice may be updated when site features or legal requirements change. The date
              above shows the latest revision.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xs uppercase tracking-[0.14em] text-[#8f8475]">Contact</h2>
            <p className="text-sm text-[#4f4538] leading-relaxed">
              For privacy-related questions, contact me at{" "}
              <a
                href="mailto:privacy@yflong.dev"
                className="underline underline-offset-4 text-[#8a7451] transition-colors"
              >
                privacy@yflong.dev
              </a>
              .
            </p>
          </section>
        </article>
      </main>
      <SiteFooter />
    </div>
  )
}
