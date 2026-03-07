"use client"

import React from "react"
import { motion } from "framer-motion"
import { services, incidents, systemMetrics, overallStatus } from "@/config/status"
import ServiceStatus from "@/components/status/ServiceStatus"
import IncidentCard from "@/components/status/IncidentCard"
import SystemMetrics from "@/components/status/SystemMetrics"
import OverallStatus from "@/components/status/OverallStatus"

const StatusDashboard: React.FC = () => {
  const days = React.useMemo(
    () =>
      Array.from({ length: 90 }, () => {
        const roll = Math.random()
        return roll < 0.02 ? "down" : roll < 0.07 ? "partial" : "up"
      }),
    [],
  )

  const activeIncidents = incidents.filter((incident) => incident.status !== "resolved")

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 space-y-7">
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-left space-y-2"
      >
        <p className="aman-eyebrow">service overview</p>
        <h1 className="aman-display text-3xl sm:text-4xl text-[#3b342c]">Status</h1>
        <p className="text-sm text-[#6f6558]">Availability, incidents, and service health in one view.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08 }}
      >
        <OverallStatus status={overallStatus} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.13 }}
        className="swift-surface rounded-lg p-4 sm:p-5 space-y-3"
      >
        <h2 className="aman-eyebrow">90 days uptime</h2>
        <div className="flex items-center gap-0.5 w-full">
          {days.map((state, i) => (
            <div
              key={i}
              className={`flex-1 h-7 rounded-[3px] ${
                state === "down" ? "bg-[#b77970]" : state === "partial" ? "bg-[#bf9560]" : "bg-[#8ba17b]"
              }`}
              title={`Day ${90 - i}: ${state === "down" ? "Major outage" : state === "partial" ? "Partial outage" : "Operational"}`}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-[#7f7364]">
          <span>90 days ago</span>
          <span className="font-medium text-[#5e5344]">99.2% uptime</span>
          <span>today</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.18 }}
      >
        <SystemMetrics metrics={systemMetrics} />
      </motion.div>

      {activeIncidents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.24 }}
          className="space-y-4"
        >
          <h2 className="aman-eyebrow flex items-center gap-2.5">
            <div className="w-2 h-2 bg-[#b77970] rounded-full animate-pulse" />
            active incidents
          </h2>
          <div className="space-y-4">
            {activeIncidents.map((incident, index) => (
              <IncidentCard key={incident.id} incident={incident} index={index} />
            ))}
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="space-y-4"
      >
        <h2 className="aman-eyebrow">services</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <ServiceStatus key={service.id} service={service} index={index} />
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="space-y-4"
      >
        <h2 className="aman-eyebrow">recent incidents</h2>
        <div className="space-y-4">
          {incidents
            .filter((incident) => incident.status === "resolved")
            .slice(0, 3)
            .map((incident, index) => (
              <IncidentCard key={incident.id} incident={incident} index={index} />
            ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.45 }}
        className="text-center py-8 border-t border-[#d7ccbc]"
      >
        <p className="text-[#8f8475] text-xs tracking-[0.12em] uppercase">
          last updated: {new Date().toLocaleString()}
        </p>
      </motion.div>
    </div>
  )
}

export default StatusDashboard
