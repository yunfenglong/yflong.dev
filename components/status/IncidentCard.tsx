"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Eye, Search } from 'lucide-react'
import type { Incident } from '@/config/status'

interface IncidentCardProps {
  incident: Incident
  index: number
}

const statusConfig = {
  investigating: {
    icon: Search,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
    borderColor: 'border-yellow-400/20',
    label: 'Investigating',
  },
  identified: {
    icon: AlertTriangle,
    color: 'text-orange-400',
    bgColor: 'bg-orange-400/10',
    borderColor: 'border-orange-400/20',
    label: 'Identified',
  },
  monitoring: {
    icon: Eye,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    borderColor: 'border-blue-400/20',
    label: 'Monitoring',
  },
  resolved: {
    icon: CheckCircle,
    color: 'text-green-400',
    bgColor: 'bg-green-400/10',
    borderColor: 'border-green-400/20',
    label: 'Resolved',
  },
}

const impactConfig = {
  minor: {
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
    label: 'Minor',
  },
  major: {
    color: 'text-orange-400',
    bgColor: 'bg-orange-400/10',
    label: 'Major',
  },
  critical: {
    color: 'text-red-400',
    bgColor: 'bg-red-400/10',
    label: 'Critical',
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
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={`
        relative overflow-hidden rounded-lg border backdrop-blur-xl
        bg-black/20 border-white/10 hover:border-white/20
        transition-all duration-300
      `}
    >
      {/* Glass morphism effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
      
      <div className="relative z-10">
        {/* Header */}
        <div 
          className="p-4 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-3">
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${statusConf.bgColor} ${statusConf.borderColor} border`}>
                  <StatusIcon className={`w-3 h-3 ${statusConf.color}`} />
                  <span className={`text-xs font-medium ${statusConf.color}`}>
                    {statusConf.label}
                  </span>
                </div>
                <div className={`px-2 py-1 rounded-full ${impactConf.bgColor}`}>
                  <span className={`text-xs font-medium ${impactConf.color}`}>
                    {impactConf.label} Impact
                  </span>
                </div>
              </div>
              
              <h3 className="font-mono font-medium text-white text-sm">
                {incident.title}
              </h3>

              <p className="text-gray-400 text-xs font-mono">
                {incident.description}
              </p>
              
              <div className="flex items-center space-x-4 text-xs text-gray-500 font-mono">
                <span>started: {incident.createdAt.toLocaleString()}</span>
                <span>updated: {incident.updatedAt.toLocaleString()}</span>
              </div>
            </div>
            
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="ml-4 p-1"
            >
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </motion.div>
          </div>
        </div>

        {/* Expandable Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-white/10"
            >
              <div className="p-4 space-y-4">
                {/* Affected Services */}
                {incident.affectedServices.length > 0 && (
                  <div>
                    <h4 className="text-xs font-mono font-medium text-white mb-2">affected services</h4>
                    <div className="flex flex-wrap gap-2">
                      {incident.affectedServices.map((serviceId) => (
                        <span
                          key={serviceId}
                          className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300"
                        >
                          {serviceId}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Updates Timeline */}
                <div>
                  <h4 className="text-xs font-mono font-medium text-white mb-3">updates</h4>
                  <div className="space-y-3">
                    {incident.updates.map((update, updateIndex) => {
                      const updateStatusConf = statusConfig[update.status]
                      const UpdateIcon = updateStatusConf.icon
                      
                      return (
                        <div key={update.id} className="flex space-x-3">
                          <div className={`flex-shrink-0 w-6 h-6 rounded-full ${updateStatusConf.bgColor} ${updateStatusConf.borderColor} border flex items-center justify-center`}>
                            <UpdateIcon className={`w-3 h-3 ${updateStatusConf.color}`} />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className={`text-xs font-medium ${updateStatusConf.color}`}>
                                {updateStatusConf.label}
                              </span>
                              <span className="text-xs text-gray-500">
                                {update.timestamp.toLocaleString()}
                              </span>
                            </div>
                            <p className="text-xs text-gray-300 font-mono">
                              {update.message}
                            </p>
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
      </div>
    </motion.div>
  )
}

export default IncidentCard
