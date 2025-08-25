"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { services, incidents, systemMetrics, overallStatus } from '@/config/status'
import ServiceStatus from '@/components/status/ServiceStatus'
import IncidentCard from '@/components/status/IncidentCard'
import SystemMetrics from '@/components/status/SystemMetrics'
import OverallStatus from '@/components/status/OverallStatus'

const StatusDashboard: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 space-y-6 pt-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-left space-y-3"
      >
        <h1 className="text-xl font-mono font-bold text-white">
          status
        </h1>
        {/* <p className="text-gray-400 text-sm font-mono">
          real-time monitoring of all services and infrastructure
        </p> */}
      </motion.div>

      {/* Overall Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <OverallStatus status={overallStatus} />
      </motion.div>

      {/* 90-day Status Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="space-y-3"
      >
        <h2 className="text-sm font-mono font-medium text-white">90 days uptime</h2>
        <div className="flex items-center gap-0.5 w-full">
          {Array.from({ length: 90 }, (_, i) => {
            const isDown = Math.random() < 0.02 // 2% chance of downtime
            const isPartial = Math.random() < 0.05 // 5% chance of partial outage
            return (
              <div
                key={i}
                className={`flex-1 h-8 rounded-sm ${
                  isDown ? 'bg-red-500' :
                  isPartial ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                title={`Day ${90 - i}: ${isDown ? 'Major outage' : isPartial ? 'Partial outage' : 'Operational'}`}
              />
            )
          })}
        </div>
        <div className="flex justify-between text-xs text-gray-500 font-mono">
          <span>90 days ago</span>
          <span>99.2% uptime</span>
          <span>today</span>
        </div>
      </motion.div>

      {/* System Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <SystemMetrics metrics={systemMetrics} />
      </motion.div>

      {/* Active Incidents */}
      {incidents.filter(incident => incident.status !== 'resolved').length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-4"
        >
          <h2 className="text-sm font-mono font-medium text-white flex items-center gap-3">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            active incidents
          </h2>
          <div className="space-y-4">
            {incidents
              .filter(incident => incident.status !== 'resolved')
              .map((incident, index) => (
                <IncidentCard key={incident.id} incident={incident} index={index} />
              ))}
          </div>
        </motion.div>
      )}

      {/* Services Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="space-y-4"
      >
        <h2 className="text-sm font-mono font-medium text-white">services</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <ServiceStatus key={service.id} service={service} index={index} />
          ))}
        </div>
      </motion.div>

      {/* Recent Incidents */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="space-y-4"
      >
        <h2 className="text-sm font-mono font-medium text-white">recent incidents</h2>
        <div className="space-y-4">
          {incidents
            .filter(incident => incident.status === 'resolved')
            .slice(0, 3)
            .map((incident, index) => (
              <IncidentCard key={incident.id} incident={incident} index={index} />
            ))}
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="text-center py-8 border-t border-white/10"
      >
        <p className="text-gray-500 text-xs font-mono">
          last updated: {new Date().toLocaleString()}
          {/* <a href="https://github.com/yunfenglong/wanfung.me" className="ml-2 text-white/60 hover:text-white transition-colors">
            view source
          </a> */}
        </p>
      </motion.div>
    </div>
  )
}

export default StatusDashboard
