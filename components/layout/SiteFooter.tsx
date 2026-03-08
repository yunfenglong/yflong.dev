"use client"

import Link from "next/link"
import { profileConfig } from "@/config/profile"

export default function SiteFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer
      data-layout-footer
      className="px-[5%] pb-[max(2rem,env(safe-area-inset-bottom))] pt-6"
    >
      <div className="w-full max-w-[61.25rem] mx-auto">
        <div className="swift-nav flex items-center justify-between pt-3">
          <p className="text-[0.64rem] uppercase tracking-[0.14em] text-[#7e7364]">
            © {currentYear} {profileConfig.name}
          </p>
          <div className="flex items-center gap-4 flex-wrap justify-end">
            <Link href="/contact" className="swift-pill hover:text-[#2f2a24] transition-colors">
              contact
            </Link>
            <Link href="/status" className="swift-pill hover:text-[#2f2a24] transition-colors">
              status
            </Link>
            <Link href="/privacy" className="swift-pill hover:text-[#2f2a24] transition-colors">
              privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
