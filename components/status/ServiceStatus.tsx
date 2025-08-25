"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, AlertTriangle, XCircle, Wrench, Clock } from 'lucide-react'
import type { Service } from '@/config/status'

interface ServiceStatusProps {
  service: Service
  index: number
}

const statusConfig = {
  operational: {
    icon: CheckCircle,
    color: 'text-green-400',
    bgColor: 'bg-green-400/10',
    borderColor: 'border-green-400/20',
    label: 'Operational',
  },
  degraded: {
    icon: AlertTriangle,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
    borderColor: 'border-yellow-400/20',
    label: 'Degraded',
  },
  partial_outage: {
    icon: AlertTriangle,
    color: 'text-orange-400',
    bgColor: 'bg-orange-400/10',
    borderColor: 'border-orange-400/20',
    label: 'Partial Outage',
  },
  major_outage: {
    icon: XCircle,
    color: 'text-red-400',
    bgColor: 'bg-red-400/10',
    borderColor: 'border-red-400/20',
    label: 'Major Outage',
  },
  maintenance: {
    icon: Wrench,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    borderColor: 'border-blue-400/20',
    label: 'Maintenance',
  },
}

const ServiceStatus: React.FC<ServiceStatusProps> = ({ service, index }) => {
  const config = statusConfig[service.status]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`
        relative overflow-hidden rounded-lg border backdrop-blur-xl
        bg-black/20 border-white/10 hover:border-white/20
        p-4 transition-all duration-300
      `}
    >
      {/* Glass morphism effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
      
      <div className="relative z-10 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-mono font-medium text-white text-sm truncate pr-2">
            {service.name}
          </h3>
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${config.bgColor} ${config.borderColor} border`}>
            <Icon className={`w-3 h-3 ${config.color}`} />
            <span className={`text-xs font-medium ${config.color}`}>
              {config.label}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-400 text-xs font-mono">
          {service.description}
        </p>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide font-mono">uptime</div>
            <div className="text-xs font-mono text-white">
              {service.uptime.toFixed(2)}%
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide font-mono">response</div>
            <div className="text-xs font-mono text-white">
              {service.responseTime}ms
            </div>
          </div>
        </div>

        {/* Last Incident */}
        {service.lastIncident && (
          <div className="flex items-center space-x-2 pt-2 border-t border-white/10">
            <Clock className="w-3 h-3 text-gray-500" />
            <span className="text-xs text-gray-500 font-mono">
              last incident: {service.lastIncident}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default ServiceStatus
