"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, AlertTriangle, CheckCircle, Eye, Search } from "lucide-react"
import type { Incident } from "@/config/status"

interface IncidentCardProps {
  incident: Incident
  index: number
}

const statusConfig = {
  investigating: {
    icon: Search,
    color: "text-[#9b7441]",
    bgColor: "bg-[#f5ecdf]",
    borderColor: "border-[#e4d3bb]",
    label: "Investigating",
  },
  identified: {
    icon: AlertTriangle,
    color: "text-[#9a6442]",
    bgColor: "bg-[#f4e8df]",
    borderColor: "border-[#dfc8b4]",
    label: "Identified",
  },
  monitoring: {
    icon: Eye,
    color: "text-[#75614b]",
    bgColor: "bg-[#f1ece5]",
    borderColor: "border-[#d9cdbf]",
    label: "Monitoring",
  },
  resolved: {
    icon: CheckCircle,
    color: "text-[#607758]",
    bgColor: "bg-[#eef2ea]",
    borderColor: "border-[#c9d4c1]",
    label: "Resolved",
  },
}

const impactConfig = {
  minor: {
    color: "text-[#9b7441]",
    bgColor: "bg-[#efe2d3]",
    label: "Minor",
  },
  major: {
    color: "text-[#9a6442]",
    bgColor: "bg-[#efddce]",
    label: "Major",
  },
  critical: {
    color: "text-[#914840]",
    bgColor: "bg-[#edd8d5]",
    label: "Critical",
  },
}

const IncidentCard: React.FC<IncidentCardProps> = ({ incident, index }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const statusConf = statusConfig[incident.status]
  const impactConf = impactConfig[incident.impact]
  const StatusIcon = statusConf.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08 }}
      className="swift-surface rounded-lg"
    >
      <div className="p-4 cursor-pointer" onClick={() => setIsExpanded((prev) => !prev)}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <div className="flex items-center flex-wrap gap-2">
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full border ${statusConf.bgColor} ${statusConf.borderColor}`}>
                <StatusIcon className={`w-3 h-3 ${statusConf.color}`} />
                <span className={`text-[11px] font-semibold ${statusConf.color}`}>{statusConf.label}</span>
              </div>
              <div className={`px-2 py-1 rounded-full ${impactConf.bgColor}`}>
                <span className={`text-[11px] font-semibold ${impactConf.color}`}>{impactConf.label} impact</span>
              </div>
            </div>

            <h3 className="font-semibold text-[#3f372e] text-sm">{incident.title}</h3>
            <p className="text-[#6f6558] text-xs">{incident.description}</p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-[#8f8475]">
              <span>started: {incident.createdAt.toLocaleString()}</span>
              <span>updated: {incident.updatedAt.toLocaleString()}</span>
            </div>
          </div>

          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="p-1"
            aria-hidden="true"
          >
            <ChevronDown className="w-5 h-5 text-[#8f8475]" />
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="border-t border-[#d7ccbc]"
          >
            <div className="p-4 space-y-4">
              {incident.affectedServices.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-[#5b5144] mb-2 uppercase tracking-[0.12em]">
                    affected services
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {incident.affectedServices.map((serviceId) => (
                      <span
                        key={serviceId}
                        className="px-2 py-1 bg-[#efe7db] rounded-md text-xs text-[#6f6558]"
                      >
                        {serviceId}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-xs font-semibold text-[#5b5144] mb-3 uppercase tracking-[0.12em]">updates</h4>
                <div className="space-y-3">
                  {incident.updates.map((update) => {
                    const updateStatusConf = statusConfig[update.status]
                    const UpdateIcon = updateStatusConf.icon

                    return (
                      <div key={update.id} className="flex gap-3">
                        <div
                          className={`flex-shrink-0 w-6 h-6 rounded-full border ${updateStatusConf.bgColor} ${updateStatusConf.borderColor} flex items-center justify-center`}
                        >
                          <UpdateIcon className={`w-3 h-3 ${updateStatusConf.color}`} />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-semibold ${updateStatusConf.color}`}>{updateStatusConf.label}</span>
                            <span className="text-xs text-[#8f8475]">{update.timestamp.toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-[#6f6558]">{update.message}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default IncidentCard
