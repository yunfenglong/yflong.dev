import type { AlgorithmCategory, AlgorithmMetrics } from "@/types/algorithm"
import type { FilterValue, GroupBy, ToolbarOption } from "@/types/algorithm-visualizer"

export const storageKey = "yflong:alg:visualizer:preferences:v3"

export const controlClassName =
  "inline-flex items-center justify-center rounded-md border border-border bg-surface-inner-strong px-3 py-2 text-[0.68rem] uppercase tracking-[0.12em] text-text-secondary transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-45"

export const speedOptions = [
  { label: "0.75x", intervalMs: 1200 },
  { label: "1x", intervalMs: 750 },
  { label: "1.5x", intervalMs: 450 },
] as const

export const filterOptions: ToolbarOption<FilterValue>[] = [
  { label: "all", value: "all" },
  { label: "sorting", value: "sorting" },
  { label: "searching", value: "searching" },
  { label: "graphs", value: "graphs" },
]

export const groupOptions: ToolbarOption<GroupBy>[] = [
  { label: "none", value: "none" },
  { label: "category", value: "category" },
  { label: "difficulty", value: "difficulty" },
]

export const metricDefinitions: Array<{ key: keyof AlgorithmMetrics; label: string }> = [
  { key: "comparisons", label: "comparisons" },
  { key: "swaps", label: "swaps" },
  { key: "passes", label: "passes" },
  { key: "writes", label: "writes" },
  { key: "currentIndex", label: "current index" },
  { key: "low", label: "low" },
  { key: "mid", label: "mid" },
  { key: "high", label: "high" },
  { key: "sortedCount", label: "sorted" },
  { key: "heapSize", label: "heap size" },
  { key: "visited", label: "visited" },
  { key: "queueSize", label: "queue" },
  { key: "stackSize", label: "stack" },
  { key: "frontierSize", label: "frontier" },
  { key: "relaxations", label: "relaxations" },
  { key: "pathCost", label: "path cost" },
]

export const categoryActionPools: Record<AlgorithmCategory, string[]> = {
  sorting: [
    "compare pair",
    "swap pair",
    "shift right",
    "lock sorted value",
    "copy leftovers",
    "place pivot",
    "extract max",
  ],
  searching: [
    "inspect value",
    "inspect middle",
    "move low pointer",
    "move high pointer",
    "found target",
    "finish without match",
  ],
  graphs: [
    "visit node",
    "enqueue neighbor",
    "push neighbor",
    "relax edge",
    "finalize node",
    "found shortest path",
  ],
}
