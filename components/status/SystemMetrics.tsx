"use client"

import React from "react"
import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import type { SystemMetric } from "@/config/status"

interface SystemMetricsProps {
  metrics: SystemMetric[]
}

const statusConfig = {
  good: {
    icon: CheckCircle,
    color: "text-[#607758]",
    bgColor: "bg-[#eef2ea]",
    borderColor: "border-[#c9d4c1]",
    bar: "bg-[#7c9270]",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-[#9b7441]",
    bgColor: "bg-[#f5ecdf]",
    borderColor: "border-[#e4d3bb]",
    bar: "bg-[#b48752]",
  },
  critical: {
    icon: XCircle,
    color: "text-[#914840]",
    bgColor: "bg-[#f2e5e3]",
    borderColor: "border-[#d9bdb9]",
    bar: "bg-[#ac6259]",
  },
}

const trendConfig = {
  up: {
    icon: TrendingUp,
    color: "text-[#607758]",
    label: "Trending up",
  },
  down: {
    icon: TrendingDown,
    color: "text-[#914840]",
    label: "Trending down",
  },
  stable: {
    icon: Minus,
    color: "text-[#8f8475]",
    label: "Stable",
  },
}

const SystemMetrics: React.FC<SystemMetricsProps> = ({ metrics }) => {
  return (
    <div className="space-y-3">
      <h2 className="aman-eyebrow">system metrics</h2>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => {
          const statusConf = statusConfig[metric.status]
          const trendConf = trendConfig[metric.trend]
          const StatusIcon = statusConf.icon
          const TrendIcon = trendConf.icon

          return (
            <motion.div
              key={metric.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
              whileHover={{ scale: 1.01, y: -2 }}
              className="swift-surface rounded-lg p-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-[0.6875rem] uppercase tracking-[0.12em] text-[#8f8475]">{metric.name}</h3>
                  <div className={`p-1 rounded-full border ${statusConf.bgColor} ${statusConf.borderColor}`}>
                    <StatusIcon className={`w-3 h-3 ${statusConf.color}`} />
                  </div>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-semibold text-[#3f372e]">{metric.value.toLocaleString()}</span>
                  {metric.unit && <span className="text-xs text-[#8f8475]">{metric.unit}</span>}
                </div>

                <div className="flex items-center gap-1.5">
                  <TrendIcon className={`w-3.5 h-3.5 ${trendConf.color}`} />
                  <span className={`text-xs font-medium ${trendConf.color}`}>{trendConf.label}</span>
                </div>

                {metric.unit === "%" && (
                  <div className="w-full bg-[#e7ddcf] rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      className={`h-1.5 rounded-full ${statusConf.bar}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(metric.value, 100)}%` }}
                      transition={{ duration: 0.8, delay: index * 0.08 }}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default SystemMetrics
