"use client"

import React from "react"
import { motion } from "framer-motion"
import {
  CheckCircle2,
  Clock3,
  Gauge,
  ServerCog,
  ShieldAlert,
  Wrench,
} from "lucide-react"
import { incidents, overallStatus, services } from "@/config/status"
import type { Incident, Service } from "@/config/status"

type UptimeState = "operational" | "degraded" | "outage"

interface UptimeDay {
  date: Date
  state: UptimeState
}

interface MaintenanceWindow {
  id: string
  title: string
  startsAt: Date
  durationMinutes: number
  components: string[]
  detail: string
}

const DAY_MS = 86_400_000

const serviceStatusConfig: Record<
  Service["status"],
  { label: string; badge: string; text: string; dot: string; rank: number }
> = {
  operational: {
    label: "Operational",
    badge: "bg-[#eef2ea] border border-[#c9d4c1]",
    text: "text-[#607758]",
    dot: "bg-[#7c9270]",
    rank: 0,
  },
  degraded: {
    label: "Degraded",
    badge: "bg-[#f5ecdf] border border-[#e4d3bb]",
    text: "text-[#9b7441]",
    dot: "bg-[#b48752]",
    rank: 1,
  },
  partial_outage: {
    label: "Partial Outage",
    badge: "bg-[#f4e8df] border border-[#dfc8b4]",
    text: "text-[#9a6442]",
    dot: "bg-[#b5784f]",
    rank: 2,
  },
  major_outage: {
    label: "Major Outage",
    badge: "bg-[#f2e5e3] border border-[#d9bdb9]",
    text: "text-[#914840]",
    dot: "bg-[#ac6259]",
    rank: 3,
  },
  maintenance: {
    label: "Maintenance",
    badge: "bg-[#f1ece5] border border-[#d9cdbf]",
    text: "text-[#75614b]",
    dot: "bg-[#8a7451]",
    rank: 1,
  },
}

const incidentStatusConfig: Record<
  Incident["status"],
  { label: string; badge: string; text: string }
> = {
  investigating: {
    label: "Investigating",
    badge: "bg-[#f5ecdf] border border-[#e4d3bb]",
    text: "text-[#9b7441]",
  },
  identified: {
    label: "Identified",
    badge: "bg-[#f4e8df] border border-[#dfc8b4]",
    text: "text-[#9a6442]",
  },
  monitoring: {
    label: "Monitoring",
    badge: "bg-[#f1ece5] border border-[#d9cdbf]",
    text: "text-[#75614b]",
  },
  resolved: {
    label: "Resolved",
    badge: "bg-[#eef2ea] border border-[#c9d4c1]",
    text: "text-[#607758]",
  },
}

const impactConfig: Record<Incident["impact"], { label: string; tone: string }> = {
  minor: { label: "Minor", tone: "text-[#9b7441] bg-[#efe2d3]" },
  major: { label: "Major", tone: "text-[#9a6442] bg-[#efddce]" },
  critical: { label: "Critical", tone: "text-[#914840] bg-[#edd8d5]" },
}

const uptimeConfig: Record<UptimeState, { label: string; block: string; availability: number }> = {
  operational: {
    label: "Operational",
    block: "bg-[#8ba17b]",
    availability: 1,
  },
  degraded: {
    label: "Degraded",
    block: "bg-[#bf9560]",
    availability: 0.996,
  },
  outage: {
    label: "Outage",
    block: "bg-[#b77970]",
    availability: 0.92,
  },
}

const toUtcDayKey = (date: Date): string => {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  const day = String(date.getUTCDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

const formatDuration = (minutes: number): string => {
  if (minutes >= 1440) {
    const days = Math.floor(minutes / 1440)
    const hours = Math.floor((minutes % 1440) / 60)
    return hours > 0 ? `${days}d ${hours}h` : `${days}d`
  }

  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    const restMinutes = minutes % 60
    return restMinutes > 0 ? `${hours}h ${restMinutes}m` : `${hours}h`
  }

  return `${minutes}m`
}

const formatDateTime = (value: Date): string =>
  value.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })

const formatRelativeTime = (targetDate: Date, now: Date): string => {
  const diffMs = targetDate.getTime() - now.getTime()
  const absMs = Math.abs(diffMs)
  const absMinutes = Math.floor(absMs / 60_000)

  if (absMinutes < 60) {
    return diffMs >= 0
      ? `in ${Math.max(1, absMinutes)}m`
      : `${Math.max(1, absMinutes)}m ago`
  }

  const absHours = Math.floor(absMinutes / 60)
  if (absHours < 24) {
    return diffMs >= 0 ? `in ${absHours}h` : `${absHours}h ago`
  }

  const absDays = Math.floor(absHours / 24)
  return diffMs >= 0 ? `in ${absDays}d` : `${absDays}d ago`
}

const getIncidentDurationMinutes = (incident: Incident): number =>
  Math.max(
    1,
    Math.round((incident.updatedAt.getTime() - incident.createdAt.getTime()) / 60_000),
  )

const getDailyStateFromIncident = (incident: Incident): UptimeState => {
  if (incident.impact === "critical" || incident.status === "investigating") {
    return "outage"
  }
  return incident.impact === "major" ? "outage" : "degraded"
}

const buildUptimeHistory = (referenceDate: Date, incidentItems: Incident[]): UptimeDay[] => {
  const incidentMap = new Map<string, UptimeState>()

  incidentItems.forEach((incident) => {
    const key = toUtcDayKey(incident.createdAt)
    const currentState = incidentMap.get(key)
    const nextState = getDailyStateFromIncident(incident)

    if (!currentState || uptimeConfig[nextState].availability < uptimeConfig[currentState].availability) {
      incidentMap.set(key, nextState)
    }
  })

  return Array.from({ length: 90 }, (_, index) => {
    const dayOffset = 89 - index
    const date = new Date(referenceDate.getTime() - dayOffset * DAY_MS)
    const key = toUtcDayKey(date)
    const incidentState = incidentMap.get(key)

    // Deterministic low-noise degradation to keep the chart realistic but stable.
    const deterministicSignal = (index * 19 + 7) % 73
    const fallbackState: UptimeState =
      deterministicSignal === 0 ? "degraded" : "operational"

    return {
      date,
      state: incidentState ?? fallbackState,
    }
  })
}

const calculateAvailability = (history: UptimeDay[]): number => {
  const score = history.reduce((total, day) => total + uptimeConfig[day.state].availability, 0)
  return (score / history.length) * 100
}

const buildMaintenanceWindows = (referenceDate: Date): MaintenanceWindow[] => {
  const firstWindow = new Date(referenceDate.getTime() + 36 * 60 * 60 * 1000)
  const secondWindow = new Date(referenceDate.getTime() + 6 * DAY_MS)

  return [
    {
      id: "mw-001",
      title: "ML Integration model serving upgrade",
      startsAt: firstWindow,
      durationMinutes: 90,
      components: ["ML Integration"],
      detail:
        "Rolling restart of model workers and cache warm-up. Brief latency spikes expected.",
    },
    {
      id: "mw-002",
      title: "API Gateway certificate rotation",
      startsAt: secondWindow,
      durationMinutes: 45,
      components: ["API Gateway", "Web Application"],
      detail:
        "Certificate rollover and edge propagation. No downtime expected during maintenance window.",
    },
  ]
}

const StatusDashboard: React.FC = () => {
  const snapshotTime = React.useMemo(() => new Date(), [])

  const sortedServices = React.useMemo(
    () =>
      [...services].sort(
        (left, right) =>
          serviceStatusConfig[left.status].rank - serviceStatusConfig[right.status].rank ||
          left.name.localeCompare(right.name),
      ),
    [],
  )

  const uptimeHistory = React.useMemo(() => buildUptimeHistory(snapshotTime, incidents), [snapshotTime])
  const ninetyDayAvailability = React.useMemo(
    () => calculateAvailability(uptimeHistory),
    [uptimeHistory],
  )

  const activeIncidents = React.useMemo(
    () => incidents.filter((incident) => incident.status !== "resolved"),
    [],
  )

  const resolvedIncidents = React.useMemo(
    () =>
      incidents
        .filter((incident) => incident.status === "resolved")
        .sort((left, right) => right.updatedAt.getTime() - left.updatedAt.getTime()),
    [],
  )

  const avgResponseTime = React.useMemo(
    () =>
      Math.round(
        services.reduce((total, service) => total + service.responseTime, 0) /
          Math.max(1, services.length),
      ),
    [],
  )

  const p95ResponseTime = React.useMemo(() => {
    const ordered = [...services].map((service) => service.responseTime).sort((a, b) => a - b)
    const index = Math.min(ordered.length - 1, Math.floor(ordered.length * 0.95))
    return ordered[index]
  }, [])

  const operationalCount = React.useMemo(
    () => services.filter((service) => service.status === "operational").length,
    [],
  )

  const maintenanceWindows = React.useMemo(
    () => buildMaintenanceWindows(snapshotTime),
    [snapshotTime],
  )

  const overallStatusTheme = serviceStatusConfig[overallStatus.status]

  return (
    <div className="w-full max-w-[61.25rem] mx-auto px-0 space-y-7">
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-3"
      >
        <p className="aman-eyebrow">service status</p>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="aman-display text-3xl sm:text-4xl text-text-primary">System Status</h1>
            <p className="text-sm text-[#6f6558] max-w-[48ch]">
              Demonstration telemetry: availability, performance metrics, incidents, and maintenance
              updates for portfolio projects.
            </p>
          </div>
          <div
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 ${overallStatusTheme.badge}`}
          >
            <span className={`h-2 w-2 rounded-full ${overallStatusTheme.dot}`} />
            <span className={`text-xs font-semibold uppercase tracking-[0.12em] ${overallStatusTheme.text}`}>
              {overallStatusTheme.label}
            </span>
          </div>
        </div>
      </motion.header>

      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.04 }}
        className="swift-surface-strong rounded-lg p-5 sm:p-6 space-y-3"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-text-secondary">{overallStatus.message}</p>
            <p className="mt-1 text-[0.68rem] uppercase tracking-[0.14em] text-muted">
              Last updated: {formatDateTime(overallStatus.lastUpdated)}
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-md border border-border bg-[#f8f3ea] px-2.5 py-1.5">
            <Clock3 className="h-3.5 w-3.5 text-[#7b705f]" />
            <span className="text-xs text-[#6a5f50]">
              Snapshot taken {formatRelativeTime(snapshotTime, new Date())}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-md border border-border bg-[#f8f3ea] p-3">
            <div className="flex items-center justify-between">
              <span className="text-[0.65rem] uppercase tracking-[0.12em] text-muted">90d uptime</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-[#607758]" />
            </div>
            <p className="mt-1 text-lg font-semibold text-[#3f372e]">{ninetyDayAvailability.toFixed(3)}%</p>
          </div>
          <div className="rounded-md border border-border bg-[#f8f3ea] p-3">
            <div className="flex items-center justify-between">
              <span className="text-[0.65rem] uppercase tracking-[0.12em] text-muted">Avg response</span>
              <Gauge className="h-3.5 w-3.5 text-[#75614b]" />
            </div>
            <p className="mt-1 text-lg font-semibold text-[#3f372e]">{avgResponseTime}ms</p>
          </div>
          <div className="rounded-md border border-border bg-[#f8f3ea] p-3">
            <div className="flex items-center justify-between">
              <span className="text-[0.65rem] uppercase tracking-[0.12em] text-muted">P95 response</span>
              <ServerCog className="h-3.5 w-3.5 text-[#75614b]" />
            </div>
            <p className="mt-1 text-lg font-semibold text-[#3f372e]">{p95ResponseTime}ms</p>
          </div>
          <div className="rounded-md border border-border bg-[#f8f3ea] p-3">
            <div className="flex items-center justify-between">
              <span className="text-[0.65rem] uppercase tracking-[0.12em] text-muted">Operational services</span>
              <ShieldAlert className="h-3.5 w-3.5 text-[#75614b]" />
            </div>
            <p className="mt-1 text-lg font-semibold text-[#3f372e]">
              {operationalCount}/{services.length}
            </p>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
        className="swift-surface rounded-lg p-4 sm:p-5 space-y-3"
      >
        <h2 className="aman-eyebrow">90 day uptime timeline</h2>
        <div className="flex w-full gap-[0.125rem]">
          {uptimeHistory.map((day) => {
            const config = uptimeConfig[day.state]
            return (
              <div
                key={`${toUtcDayKey(day.date)}-${day.state}`}
                className={`h-7 flex-1 rounded-[0.1875rem] ${config.block}`}
                title={`${day.date.toLocaleDateString("en-US")}: ${config.label}`}
              />
            )
          })}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#7f7364]">
          <div className="flex items-center gap-3">
            <span>90 days ago</span>
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-[#8ba17b]" />
              <span>Operational</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-[#bf9560]" />
              <span>Degraded</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-[#b77970]" />
              <span>Outage</span>
            </div>
          </div>
          <span>Today</span>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.12 }}
        className="swift-surface rounded-lg p-4 sm:p-5 space-y-3"
      >
        <h2 className="aman-eyebrow">components</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[46rem] text-left">
            <thead>
              <tr className="border-b border-border text-[0.65rem] uppercase tracking-[0.12em] text-muted">
                <th className="py-2 pr-3 font-medium">Component</th>
                <th className="py-2 pr-3 font-medium">Status</th>
                <th className="py-2 pr-3 font-medium">90d Uptime</th>
                <th className="py-2 pr-3 font-medium">Latency</th>
                <th className="py-2 font-medium">Last Incident</th>
              </tr>
            </thead>
            <tbody>
              {sortedServices.map((service) => {
                const config = serviceStatusConfig[service.status]
                return (
                  <tr key={service.id} className="border-b border-[#e3d8c8] last:border-none">
                    <td className="py-3 pr-3">
                      <p className="text-sm font-semibold text-[#3f372e]">{service.name}</p>
                      <p className="text-xs text-[#7a6f61]">{service.description}</p>
                    </td>
                    <td className="py-3 pr-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.68rem] font-semibold ${config.badge} ${config.text}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
                        {config.label}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-sm text-text-secondary">{service.uptime.toFixed(2)}%</td>
                    <td className="py-3 pr-3 text-sm text-text-secondary">{service.responseTime}ms</td>
                    <td className="py-3 text-sm text-[#6f6558]">{service.lastIncident ?? "No incidents in last 30 days"}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.16 }}
        className="grid gap-4 lg:grid-cols-2"
      >
        <div className="swift-surface rounded-lg p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="aman-eyebrow">active incidents</h2>
            <span className="text-[0.68rem] uppercase tracking-[0.12em] text-muted">
              {activeIncidents.length} open
            </span>
          </div>

          {activeIncidents.length === 0 && (
            <div className="rounded-md border border-[#c9d4c1] bg-[#eef2ea] p-3 text-sm text-[#607758]">
              No active incidents.
            </div>
          )}

          {activeIncidents.map((incident) => {
            const status = incidentStatusConfig[incident.status]
            const impact = impactConfig[incident.impact]
            const updates = [...incident.updates].sort(
              (left, right) => right.timestamp.getTime() - left.timestamp.getTime(),
            )

            return (
              <div key={incident.id} className="rounded-md border border-border bg-[#f7f2e9] p-3 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-[0.66rem] font-semibold ${status.badge} ${status.text}`}
                  >
                    {status.label}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-[0.66rem] font-semibold ${impact.tone}`}
                  >
                    {impact.label} impact
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-[#3f372e]">{incident.title}</h3>
                <p className="text-xs text-[#6f6558]">{incident.description}</p>
                <p className="text-[0.66rem] uppercase tracking-[0.12em] text-muted">
                  Started: {formatDateTime(incident.createdAt)}
                </p>

                <div className="space-y-2 border-l border-border pl-3">
                  {updates.slice(0, 3).map((update) => (
                    <div key={update.id}>
                      <div className="flex items-center gap-2">
                        <span className="text-[0.66rem] uppercase tracking-[0.12em] text-[#7f7364]">
                          {formatDateTime(update.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted-dark">{update.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <div className="swift-surface rounded-lg p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="aman-eyebrow">scheduled maintenance</h2>
            <Wrench className="h-4 w-4 text-[#8a7451]" />
          </div>
          {maintenanceWindows.map((window) => (
            <div key={window.id} className="rounded-md border border-border bg-[#f7f2e9] p-3 space-y-1.5">
              <p className="text-sm font-semibold text-[#3f372e]">{window.title}</p>
              <p className="text-xs text-[#6f6558]">{window.detail}</p>
              <p className="text-[0.66rem] uppercase tracking-[0.12em] text-muted">
                Starts: {formatDateTime(window.startsAt)} ({formatRelativeTime(window.startsAt, snapshotTime)})
              </p>
              <p className="text-[0.66rem] uppercase tracking-[0.12em] text-muted">
                Duration: {formatDuration(window.durationMinutes)}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {window.components.map((component) => (
                  <span
                    key={component}
                    className="rounded-full border border-[#dccfbf] bg-[#efe5d8] px-2 py-0.5 text-[0.64rem] uppercase tracking-[0.1em] text-[#6f6558]"
                  >
                    {component}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="swift-surface rounded-lg p-4 sm:p-5 space-y-3"
      >
        <h2 className="aman-eyebrow">recently resolved incidents</h2>
        {resolvedIncidents.length === 0 ? (
          <p className="text-sm text-[#6f6558]">No resolved incidents in the current window.</p>
        ) : (
          <div className="space-y-2">
            {resolvedIncidents.map((incident) => (
              <div
                key={incident.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-[#f7f2e9] p-3"
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-[#3f372e]">{incident.title}</p>
                  <p className="text-xs text-[#6f6558]">
                    Resolved {formatDateTime(incident.updatedAt)} • Duration{" "}
                    {formatDuration(getIncidentDurationMinutes(incident))}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs text-[#607758]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Resolved
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.section>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.24 }}
        className="border-t border-border pt-6 pb-2 text-center space-y-1"
      >
        <p className="text-[0.68rem] uppercase tracking-[0.14em] text-muted">
          Last synced: {formatDateTime(snapshotTime)}
        </p>
        <p className="text-xs text-[#7b6f60]">
          Need alerts? Email{" "}
          <a href="mailto:status_subscribe@yflong.dev" className="underline underline-offset-4">
            status_subscribe@yflong.dev
          </a>
          .
        </p>
      </motion.footer>
    </div>
  )
}

export default StatusDashboard
