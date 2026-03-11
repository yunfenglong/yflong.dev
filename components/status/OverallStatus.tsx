"use client"

import React from "react"
import { motion } from "framer-motion"
import { CheckCircle, AlertTriangle, XCircle, Wrench } from "lucide-react"

interface OverallStatusProps {
  status: {
    status: "operational" | "degraded" | "partial_outage" | "major_outage" | "maintenance"
    message: string
    lastUpdated: Date
  }
}

const statusConfig = {
  operational: {
    icon: CheckCircle,
    color: "text-[#607758]",
    bgColor: "bg-[#eef2ea]",
    borderColor: "border-[#c9d4c1]",
    dotColor: "bg-[#7c9270]",
    label: "All systems operational",
  },
  degraded: {
    icon: AlertTriangle,
    color: "text-[#9b7441]",
    bgColor: "bg-[#f5ecdf]",
    borderColor: "border-[#e4d3bb]",
    dotColor: "bg-[#b48752]",
    label: "Degraded performance",
  },
  partial_outage: {
    icon: AlertTriangle,
    color: "text-[#9a6442]",
    bgColor: "bg-[#f4e8df]",
    borderColor: "border-[#dfc8b4]",
    dotColor: "bg-[#b5784f]",
    label: "Partial service outage",
  },
  major_outage: {
    icon: XCircle,
    color: "text-[#914840]",
    bgColor: "bg-[#f2e5e3]",
    borderColor: "border-[#d9bdb9]",
    dotColor: "bg-[#ac6259]",
    label: "Major service outage",
  },
  maintenance: {
    icon: Wrench,
    color: "text-[#75614b]",
    bgColor: "bg-[#f1ece5]",
    borderColor: "border-[#d9cdbf]",
    dotColor: "bg-[#8a7451]",
    label: "Scheduled maintenance",
  },
}

const OverallStatus: React.FC<OverallStatusProps> = ({ status }) => {
  const config = statusConfig[status.status]
  const Icon = config.icon

  return (
    <motion.div
      className="swift-surface-strong rounded-lg p-6 md:p-7"
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          <div className={`p-3 rounded-md border ${config.bgColor} ${config.borderColor} flex-shrink-0`}>
            <Icon className={`w-6 h-6 ${config.color}`} />
          </div>
          <div className="min-w-0">
            <h3 className={`aman-display text-xl ${config.color}`}>{config.label}</h3>
            <p className="text-text-secondary mt-1.5 text-sm">{status.message}</p>
            <p className="text-muted text-xs mt-2 uppercase tracking-[0.12em]">
              last updated: {status.lastUpdated.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className={`w-2.5 h-2.5 rounded-full ${config.dotColor} animate-pulse`} />
          <span className="text-muted text-xs font-semibold tracking-[0.16em] uppercase">live</span>
        </div>
      </div>
    </motion.div>
  )
}

export default OverallStatus
