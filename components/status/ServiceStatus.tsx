"use client"

import React from "react"
import { motion } from "framer-motion"
import { CheckCircle, AlertTriangle, XCircle, Wrench, Clock } from "lucide-react"
import type { Service } from "@/config/status"

interface ServiceStatusProps {
  service: Service
  index: number
}

const statusConfig = {
  operational: {
    icon: CheckCircle,
    color: "text-[#607758]",
    bgColor: "bg-[#eef2ea]",
    borderColor: "border-[#c9d4c1]",
    label: "Operational",
  },
  degraded: {
    icon: AlertTriangle,
    color: "text-[#9b7441]",
    bgColor: "bg-[#f5ecdf]",
    borderColor: "border-[#e4d3bb]",
    label: "Degraded",
  },
  partial_outage: {
    icon: AlertTriangle,
    color: "text-[#9a6442]",
    bgColor: "bg-[#f4e8df]",
    borderColor: "border-[#dfc8b4]",
    label: "Partial outage",
  },
  major_outage: {
    icon: XCircle,
    color: "text-[#914840]",
    bgColor: "bg-[#f2e5e3]",
    borderColor: "border-[#d9bdb9]",
    label: "Major outage",
  },
  maintenance: {
    icon: Wrench,
    color: "text-[#75614b]",
    bgColor: "bg-[#f1ece5]",
    borderColor: "border-[#d9cdbf]",
    label: "Maintenance",
  },
}

const ServiceStatus: React.FC<ServiceStatusProps> = ({ service, index }) => {
  const config = statusConfig[service.status]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08 }}
      whileHover={{ scale: 1.01, y: -2 }}
      className="swift-surface rounded-lg p-4 transition-all duration-300"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-[#3f372e] text-sm truncate pr-2">{service.name}</h3>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full border ${config.bgColor} ${config.borderColor}`}>
            <Icon className={`w-3 h-3 ${config.color}`} />
            <span className={`text-[11px] font-semibold ${config.color}`}>{config.label}</span>
          </div>
        </div>

        <p className="text-[#6f6558] text-xs">{service.description}</p>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#d7ccbc]">
          <div>
            <div className="text-[10px] text-[#8f8475] uppercase tracking-[0.12em]">uptime</div>
            <div className="text-xs font-medium text-[#3f372e]">{service.uptime.toFixed(2)}%</div>
          </div>
          <div>
            <div className="text-[10px] text-[#8f8475] uppercase tracking-[0.12em]">response</div>
            <div className="text-xs font-medium text-[#3f372e]">{service.responseTime}ms</div>
          </div>
        </div>

        {service.lastIncident && (
          <div className="flex items-center gap-1.5 pt-2 border-t border-[#d7ccbc]">
            <Clock className="w-3 h-3 text-[#8f8475]" />
            <span className="text-xs text-[#8f8475]">last incident: {service.lastIncident}</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default ServiceStatus
