"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, AlertTriangle, XCircle, Wrench } from 'lucide-react'

interface OverallStatusProps {
  status: {
    status: 'operational' | 'degraded' | 'partial_outage' | 'major_outage' | 'maintenance'
    message: string
    lastUpdated: Date
  }
}

const statusConfig = {
  operational: {
    icon: CheckCircle,
    color: 'text-green-400',
    bgColor: 'bg-green-400/10',
    borderColor: 'border-green-400/20',
    label: 'All Systems Operational',
  },
  degraded: {
    icon: AlertTriangle,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
    borderColor: 'border-yellow-400/20',
    label: 'Degraded Performance',
  },
  partial_outage: {
    icon: AlertTriangle,
    color: 'text-orange-400',
    bgColor: 'bg-orange-400/10',
    borderColor: 'border-orange-400/20',
    label: 'Partial Service Outage',
  },
  major_outage: {
    icon: XCircle,
    color: 'text-red-400',
    bgColor: 'bg-red-400/10',
    borderColor: 'border-red-400/20',
    label: 'Major Service Outage',
  },
  maintenance: {
    icon: Wrench,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    borderColor: 'border-blue-400/20',
    label: 'Scheduled Maintenance',
  },
}

const OverallStatus: React.FC<OverallStatusProps> = ({ status }) => {
  const config = statusConfig[status.status]
  const Icon = config.icon

  return (
    <motion.div
      className={`
        relative overflow-hidden rounded-xl border backdrop-blur-xl
        ${config.bgColor} ${config.borderColor}
        p-6 md:p-8
      `}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Glass morphism effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
      
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <div className={`p-3 rounded-full ${config.bgColor} ${config.borderColor} border flex-shrink-0`}>
            <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${config.color}`} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className={`text-base font-mono font-bold ${config.color}`}>
              {config.label}
            </h3>
            <p className="text-gray-300 mt-1 text-sm font-mono">
              {status.message}
            </p>
            <p className="text-gray-500 text-xs font-mono mt-2">
              last updated: {status.lastUpdated.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
          <div className={`w-3 h-3 rounded-full ${config.color.replace('text-', 'bg-')} animate-pulse`} />
          <span className="text-gray-400 text-sm font-mono whitespace-nowrap">LIVE</span>
        </div>
      </div>
    </motion.div>
  )
}

export default OverallStatus
