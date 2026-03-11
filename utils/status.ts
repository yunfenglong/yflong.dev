import type { Incident, UptimeState, UptimeDay, MaintenanceWindow } from "@/config/status"
import { uptimeConfig } from "@/config/status"

const DAY_MS = 86_400_000

export const toUtcDayKey = (date: Date): string => {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  const day = String(date.getUTCDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export const formatDuration = (minutes: number): string => {
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

export const formatDateTime = (value: Date): string =>
  value.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })

export const formatRelativeTime = (targetDate: Date, now: Date): string => {
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

export const getIncidentDurationMinutes = (incident: Incident): number =>
  Math.max(
    1,
    Math.round((incident.updatedAt.getTime() - incident.createdAt.getTime()) / 60_000),
  )

export const getDailyStateFromIncident = (incident: Incident): UptimeState => {
  if (incident.impact === "critical" || incident.status === "investigating") {
    return "outage"
  }
  return incident.impact === "major" ? "outage" : "degraded"
}

export const buildUptimeHistory = (referenceDate: Date, incidentItems: Incident[]): UptimeDay[] => {
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

export const calculateAvailability = (history: UptimeDay[]): number => {
  const score = history.reduce((total, day) => total + uptimeConfig[day.state].availability, 0)
  return (score / history.length) * 100
}

export const buildMaintenanceWindows = (referenceDate: Date): MaintenanceWindow[] => {
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
