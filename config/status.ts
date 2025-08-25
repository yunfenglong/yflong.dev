export interface Service {
  id: string
  name: string
  status: 'operational' | 'degraded' | 'partial_outage' | 'major_outage' | 'maintenance'
  description: string
  uptime: number
  responseTime: number
  lastIncident?: string
}

export interface Incident {
  id: string
  title: string
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved'
  impact: 'minor' | 'major' | 'critical'
  createdAt: Date
  updatedAt: Date
  description: string
  updates: IncidentUpdate[]
  affectedServices: string[]
}

export interface IncidentUpdate {
  id: string
  timestamp: Date
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved'
  message: string
}

export interface SystemMetric {
  name: string
  value: number
  unit: string
  status: 'good' | 'warning' | 'critical'
  trend: 'up' | 'down' | 'stable'
}

export const services: Service[] = [
  {
    id: 'web-app',
    name: 'Web Application',
    status: 'operational',
    description: 'Main website and terminal interface',
    uptime: 99.97,
    responseTime: 145,
  },
  {
    id: 'blog-service',
    name: 'Blog Service',
    status: 'operational',
    description: 'Blog platform at blog.yflong.dev',
    uptime: 99.95,
    responseTime: 230,
  },
  {
    id: 'dine-service',
    name: 'Dine Service',
    status: 'degraded',
    description: 'Restaurant discovery platform',
    uptime: 98.2,
    responseTime: 890,
    lastIncident: '2 hours ago',
  },
  {
    id: 'api-gateway',
    name: 'API Gateway',
    status: 'operational',
    description: 'Core API routing and authentication',
    uptime: 99.99,
    responseTime: 89,
  },
  {
    id: 'database',
    name: 'Database Cluster',
    status: 'operational',
    description: 'Primary data storage and replication',
    uptime: 99.98,
    responseTime: 12,
  },
  {
    id: 'cdn',
    name: 'CDN & Assets',
    status: 'operational',
    description: 'Content delivery and static assets',
    uptime: 99.96,
    responseTime: 67,
  },
  {
    id: 'ml-integration',
    name: 'ML Integration',
    status: 'maintenance',
    description: 'Machine learning and data processing',
    uptime: 95.1,
    responseTime: 1200,
    lastIncident: 'Scheduled maintenance',
  },
]

export const incidents: Incident[] = [
  {
    id: 'inc-001',
    title: 'Elevated response times on Dine Service',
    status: 'monitoring',
    impact: 'minor',
    createdAt: new Date('2025-01-25T14:30:00Z'),
    updatedAt: new Date('2025-01-25T16:15:00Z'),
    description: 'Users may experience slower loading times when searching for restaurants.',
    affectedServices: ['dine-service'],
    updates: [
      {
        id: 'upd-001',
        timestamp: new Date('2025-01-25T16:15:00Z'),
        status: 'monitoring',
        message: 'We have implemented a fix and are monitoring the service. Response times have improved significantly.',
      },
      {
        id: 'upd-002',
        timestamp: new Date('2025-01-25T15:45:00Z'),
        status: 'identified',
        message: 'We have identified the root cause as a database query optimization issue and are deploying a fix.',
      },
      {
        id: 'upd-003',
        timestamp: new Date('2025-01-25T14:30:00Z'),
        status: 'investigating',
        message: 'We are investigating reports of elevated response times on the Dine Service.',
      },
    ],
  },
  {
    id: 'inc-002',
    title: 'Scheduled maintenance for ML Integration',
    status: 'resolved',
    impact: 'minor',
    createdAt: new Date('2025-01-25T02:00:00Z'),
    updatedAt: new Date('2025-01-25T04:30:00Z'),
    description: 'Planned maintenance to upgrade machine learning infrastructure.',
    affectedServices: ['ml-integration'],
    updates: [
      {
        id: 'upd-004',
        timestamp: new Date('2025-01-25T04:30:00Z'),
        status: 'resolved',
        message: 'Maintenance completed successfully. All ML services are now operational.',
      },
      {
        id: 'upd-005',
        timestamp: new Date('2025-01-25T02:00:00Z'),
        status: 'monitoring',
        message: 'Maintenance window started. ML Integration services will be temporarily unavailable.',
      },
    ],
  },
]

export const systemMetrics: SystemMetric[] = [
  {
    name: 'Response Time',
    value: 245,
    unit: 'ms',
    status: 'good',
    trend: 'stable',
  },
  {
    name: 'Uptime',
    value: 99.97,
    unit: '%',
    status: 'good',
    trend: 'up',
  },
  {
    name: 'Error Rate',
    value: 0.03,
    unit: '%',
    status: 'good',
    trend: 'down',
  },
  {
    name: 'Active Users',
    value: 1247,
    unit: '',
    status: 'good',
    trend: 'up',
  },
]

export const overallStatus = {
  status: 'partial_outage' as const,
  message: 'Some services are experiencing issues',
  lastUpdated: new Date('2025-01-25T16:15:00Z'),
}
