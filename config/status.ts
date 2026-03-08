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
    description: 'Main website shell, terminal interface, and core route handling',
    uptime: 99.99,
    responseTime: 134,
  },
  {
    id: 'blog-service',
    name: 'Blog Service',
    status: 'operational',
    description: 'Native publishing routes at /blog and /blog/[slug]',
    uptime: 99.98,
    responseTime: 171,
  },
  {
    id: 'journal-service',
    name: 'Journal Service',
    status: 'operational',
    description: 'Project journal rendered from CHANGELOG.md at /journal',
    uptime: 100,
    responseTime: 142,
  },
  {
    id: 'dine-service',
    name: "Wan's Dine",
    status: 'major_outage',
    description: "Restaurant discovery platform at dine.yflong.dev",
    uptime: 97.84,
    responseTime: 5410,
    lastIncident: 'Mar 08, 2026 (active incident)',
  },
  {
    id: 'travel-service',
    name: 'Travel Service',
    status: 'operational',
    description:
      'Been There Series app for exploring luxury hotels around the world at travel.yflong.dev',
    uptime: 99.93,
    responseTime: 312,
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
    status: 'operational',
    description: 'Machine learning and data processing',
    uptime: 99.52,
    responseTime: 428,
    lastIncident: 'Mar 08, 2026 (scheduled maintenance completed)',
  },
]

export const incidents: Incident[] = [
  {
    id: 'inc-004',
    title: "Wan's Dine service outage",
    status: 'investigating',
    impact: 'major',
    createdAt: new Date('2026-03-08T08:05:00Z'),
    updatedAt: new Date('2026-03-08T08:18:00Z'),
    description: "Wan's Dine is currently unavailable and requests may fail or time out.",
    affectedServices: ['dine-service'],
    updates: [
      {
        id: 'upd-007',
        timestamp: new Date('2026-03-08T08:18:00Z'),
        status: 'investigating',
        message: 'Investigating elevated error rates and failed page loads on dine.yflong.dev.',
      },
    ],
  },
  {
    id: 'inc-003',
    title: 'Content route migration for blog and journal',
    status: 'resolved',
    impact: 'minor',
    createdAt: new Date('2026-03-08T07:10:00Z'),
    updatedAt: new Date('2026-03-08T07:42:00Z'),
    description:
      'Rolled out first-party /blog and /journal routes and replaced external navigation targets.',
    affectedServices: ['web-app', 'blog-service', 'journal-service', 'cdn'],
    updates: [
      {
        id: 'upd-001',
        timestamp: new Date('2026-03-08T07:42:00Z'),
        status: 'resolved',
        message:
          'Deployment complete. /blog, /blog/[slug], and /journal are serving normally.',
      },
      {
        id: 'upd-002',
        timestamp: new Date('2026-03-08T07:30:00Z'),
        status: 'monitoring',
        message:
          'Post-deploy checks passed for routing, static generation, and sitemap entries.',
      },
      {
        id: 'upd-003',
        timestamp: new Date('2026-03-08T07:20:00Z'),
        status: 'identified',
        message:
          'Navigation and route targets updated to first-party content paths.',
      },
      {
        id: 'upd-004',
        timestamp: new Date('2026-03-08T07:10:00Z'),
        status: 'investigating',
        message:
          'Starting migration from external content links to internal blog and journal routes.',
      },
    ],
  },
  {
    id: 'inc-002',
    title: 'Scheduled maintenance for ML Integration workers',
    status: 'resolved',
    impact: 'minor',
    createdAt: new Date('2026-03-08T05:00:00Z'),
    updatedAt: new Date('2026-03-08T05:40:00Z'),
    description: 'Planned maintenance to upgrade machine learning processing workers.',
    affectedServices: ['ml-integration'],
    updates: [
      {
        id: 'upd-005',
        timestamp: new Date('2026-03-08T05:40:00Z'),
        status: 'resolved',
        message: 'Maintenance completed successfully. ML Integration is fully operational.',
      },
      {
        id: 'upd-006',
        timestamp: new Date('2026-03-08T05:00:00Z'),
        status: 'monitoring',
        message: 'Maintenance window started for worker and runtime updates.',
      },
    ],
  },
]

export const systemMetrics: SystemMetric[] = [
  {
    name: 'Response Time',
    value: 184,
    unit: 'ms',
    status: 'good',
    trend: 'down',
  },
  {
    name: 'Uptime',
    value: 99.99,
    unit: '%',
    status: 'good',
    trend: 'up',
  },
  {
    name: 'Error Rate',
    value: 1.24,
    unit: '%',
    status: 'warning',
    trend: 'up',
  },
  {
    name: 'Active Users',
    value: 1732,
    unit: '',
    status: 'good',
    trend: 'up',
  },
]

export const overallStatus = {
  status: 'partial_outage' as const,
  message: "Wan's Dine is currently down. Other services remain operational.",
  lastUpdated: new Date('2026-03-08T08:18:00Z'),
}
