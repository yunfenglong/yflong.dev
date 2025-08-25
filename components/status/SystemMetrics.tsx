"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import type { SystemMetric } from '@/config/status'

interface SystemMetricsProps {
  metrics: SystemMetric[]
}

const statusConfig = {
  good: {
    icon: CheckCircle,
    color: 'text-green-400',
    bgColor: 'bg-green-400/10',
    borderColor: 'border-green-400/20',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
    borderColor: 'border-yellow-400/20',
  },
  critical: {
    icon: XCircle,
    color: 'text-red-400',
    bgColor: 'bg-red-400/10',
    borderColor: 'border-red-400/20',
  },
}

const trendConfig = {
  up: {
    icon: TrendingUp,
    color: 'text-green-400',
  },
  down: {
    icon: TrendingDown,
    color: 'text-red-400',
  },
  stable: {
    icon: Minus,
    color: 'text-gray-400',
  },
}

const SystemMetrics: React.FC<SystemMetricsProps> = ({ metrics }) => {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-mono font-medium text-white">system metrics</h2>
      
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
                  <h3 className="font-mono text-gray-400 text-xs uppercase tracking-wide">
                    {metric.name}
                  </h3>
                  <div className={`p-1 rounded-full ${statusConf.bgColor} ${statusConf.borderColor} border`}>
                    <StatusIcon className={`w-3 h-3 ${statusConf.color}`} />
                  </div>
                </div>

                {/* Value */}
                <div className="flex items-baseline space-x-2">
                  <span className="text-lg font-bold text-white font-mono">
                    {metric.value.toLocaleString()}
                  </span>
                  {metric.unit && (
                    <span className="text-xs text-gray-400">
                      {metric.unit}
                    </span>
                  )}
                </div>

                {/* Trend */}
                <div className="flex items-center space-x-2">
                  <TrendIcon className={`w-4 h-4 ${trendConf.color}`} />
                  <span className={`text-xs font-medium ${trendConf.color}`}>
                    {metric.trend === 'up' && 'Trending up'}
                    {metric.trend === 'down' && 'Trending down'}
                    {metric.trend === 'stable' && 'Stable'}
                  </span>
                </div>

                {/* Progress bar for percentage metrics */}
                {metric.unit === '%' && (
                  <div className="w-full bg-white/10 rounded-full h-1.5">
                    <motion.div
                      className={`h-1.5 rounded-full ${statusConf.color.replace('text-', 'bg-')}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(metric.value, 100)}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
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
