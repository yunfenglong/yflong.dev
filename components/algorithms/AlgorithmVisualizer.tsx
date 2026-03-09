"use client"

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  algorithmCatalog,
  algorithmCatalogById,
  algorithmCategories,
  graphTargetOptions,
} from "@/config/algorithms"
import type {
  AlgorithmCategory,
  AlgorithmDefinition,
  AlgorithmMetrics,
  AlgorithmStep,
  GraphDefinition,
} from "@/types/algorithm"

type FilterValue = "all" | AlgorithmCategory
type GroupBy = "none" | "category" | "difficulty"
type ToolbarOption<T extends string> = { label: string; value: T }

type PersistedState = {
  activeFilter?: FilterValue
  groupBy?: GroupBy
  selectedAlgorithmId?: string
  secondaryAlgorithmId?: string
  isCompareMode?: boolean
  quizMode?: boolean
  arrayValues?: number[]
  targetValue?: number
  graphTargetNodeId?: string
}

const storageKey = "alg-visualizer-preferences-v3"

const controlClassName =
  "inline-flex items-center justify-center rounded-md border border-[#d7ccbc] bg-[#f6f1e8] px-3 py-2 text-[0.68rem] uppercase tracking-[0.12em] text-[#4f4538] transition-colors hover:bg-[#eee5d7] disabled:cursor-not-allowed disabled:opacity-45"

const speedOptions = [
  { label: "0.75x", intervalMs: 1200 },
  { label: "1x", intervalMs: 750 },
  { label: "1.5x", intervalMs: 450 },
] as const

const filterOptions: ToolbarOption<FilterValue>[] = [
  { label: "all", value: "all" },
  { label: "sorting", value: "sorting" },
  { label: "searching", value: "searching" },
  { label: "graphs", value: "graphs" },
]

const groupOptions: ToolbarOption<GroupBy>[] = [
  { label: "none", value: "none" },
  { label: "category", value: "category" },
  { label: "difficulty", value: "difficulty" },
]

const metricDefinitions = [
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
] as const

const categoryActionPools: Record<AlgorithmCategory, string[]> = {
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

function formatCategoryLabel(category: AlgorithmCategory) {
  switch (category) {
    case "sorting":
      return "sorting"
    case "searching":
      return "searching"
    case "graphs":
      return "graphs"
    default:
      return category
  }
}

function formatDifficultyLabel(difficulty: AlgorithmDefinition["difficulty"]) {
  switch (difficulty) {
    case "beginner":
      return "beginner"
    case "intermediate":
      return "intermediate"
    case "advanced":
      return "advanced"
    default:
      return difficulty
  }
}


function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: ToolbarOption<T>[]
  onChange: (value: T) => void
}) {
  return (
    <div className="space-y-2">
      <p className="max-w-full truncate text-[0.55rem] uppercase tracking-[0.12em] text-[#8f8475] sm:text-[0.66rem] sm:tracking-[0.14em]">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isActive = option.value === value

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`rounded-full border px-3 py-1.5 text-[0.66rem] uppercase tracking-[0.12em] transition-colors ${
                isActive
                  ? "border-[#b3997a] bg-[#eadfcd] text-[#3f3528]"
                  : "border-[#d7ccbc] bg-[#f8f3eb] text-[#5b5143] hover:bg-[#eee5d7]"
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ToggleControl({
  label,
  enabled,
  disabled,
  onToggle,
}: {
  label: string
  enabled: boolean
  disabled?: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[0.66rem] uppercase tracking-[0.12em] transition-colors ${
        enabled
          ? "border-[#b3997a] bg-[#eadfcd] text-[#3f3528]"
          : "border-[#d7ccbc] bg-[#f8f3eb] text-[#5b5143] hover:bg-[#eee5d7]"
      } disabled:cursor-not-allowed disabled:opacity-45`}
    >
      <span>{label}</span>
      <span className={`h-2 w-2 rounded-full ${enabled ? "bg-[#8c7150]" : "bg-[#c6baaa]"}`} />
    </button>
  )
}

function arraysEqual(leftValues: number[], rightValues: number[]) {
  if (leftValues.length !== rightValues.length) {
    return false
  }

  return leftValues.every((value, index) => value === rightValues[index])
}

function parseArrayInput(rawInput: string) {
  return rawInput
    .split(/[\s,]+/)
    .map((token) => Number(token.trim()))
    .filter((value) => Number.isFinite(value))
    .map((value) => Math.max(1, Math.min(99, Math.round(value))))
    .slice(0, 12)
}

function randomArrayValues(length = 8) {
  return Array.from({ length }, () => Math.floor(Math.random() * 89) + 10)
}

function normalizeValuesForAlgorithm(algorithmDefinition: AlgorithmDefinition, values: number[]) {
  if (!algorithmDefinition.requiresSortedInput) {
    return [...values]
  }

  return [...values].sort((leftValue, rightValue) => leftValue - rightValue)
}

function getDefaultArrayValues(algorithmDefinition: AlgorithmDefinition | undefined) {
  if (algorithmDefinition?.defaultValues?.length) {
    return [...algorithmDefinition.defaultValues]
  }

  return [...(algorithmCatalog.find((catalogAlgorithm) => catalogAlgorithm.defaultValues?.length)?.defaultValues ?? [8, 3, 5, 1, 9, 6, 2, 7])]
}

function getDefaultTargetValue(algorithmDefinition: AlgorithmDefinition | undefined) {
  if (typeof algorithmDefinition?.defaultTargetValue === "number") {
    return algorithmDefinition.defaultTargetValue
  }

  return 23
}

function getCompareCandidates(primaryAlgorithm: AlgorithmDefinition) {
  return algorithmCatalog.filter(
    (algorithmDefinition) =>
      algorithmDefinition.id !== primaryAlgorithm.id &&
      algorithmDefinition.datasetKind === primaryAlgorithm.datasetKind,
  )
}

function formatMetricValue(value: number | undefined) {
  if (typeof value !== "number") {
    return "—"
  }

  if (!Number.isFinite(value)) {
    return "∞"
  }

  return String(value)
}

function getNextQuiz(algorithmDefinition: AlgorithmDefinition, steps: AlgorithmStep[], stepIndex: number) {
  const nextStep = steps[stepIndex + 1]

  if (!nextStep) {
    return null
  }

  const distractorPool = Array.from(
    new Set([...categoryActionPools[algorithmDefinition.category], ...steps.map((step) => step.actionLabel)]),
  ).filter((actionLabel) => actionLabel !== nextStep.actionLabel)

  const offset = stepIndex % Math.max(distractorPool.length, 1)
  const rotatedPool = distractorPool
    .slice(offset)
    .concat(distractorPool.slice(0, offset))
    .slice(0, 2)

  const options = [nextStep.actionLabel, ...rotatedPool]
    .filter((value, index, values) => values.indexOf(value) === index)
    .sort((leftOption, rightOption) => {
      const leftScore = (leftOption.length + stepIndex) % 7
      const rightScore = (rightOption.length + stepIndex) % 7
      return leftScore - rightScore
    })

  return {
    correctAnswer: nextStep.actionLabel,
    options,
    question: "What is the most likely next action?",
  }
}

function getNodeById(graph: GraphDefinition, nodeId: string) {
  return graph.nodes.find((node) => node.id === nodeId)
}

function getPrimaryDefaultId() {
  return algorithmCatalog[0]?.id ?? ""
}

function readPersistedState(): PersistedState | null {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const rawValue = window.localStorage.getItem(storageKey)

    if (!rawValue) {
      return null
    }

    return JSON.parse(rawValue) as PersistedState
  } catch {
    return null
  }
}

function isValidFilterValue(value: string | null | undefined): value is FilterValue {
  return value === "all" || algorithmCategories.includes(value as AlgorithmCategory)
}

function isValidGroupValue(value: string | null | undefined): value is GroupBy {
  return value === "none" || value === "category" || value === "difficulty"
}

function isValidAlgorithmId(value: string | null | undefined) {
  return Boolean(value && algorithmCatalogById[value])
}

function isValidGraphTarget(value: string | null | undefined) {
  return Boolean(value && graphTargetOptions.some((option) => option.value === value))
}

function ArrayBarVisualization({
  step,
}: {
  step: AlgorithmStep
}) {
  const values = step.values ?? []
  const comparedSet = new Set(step.comparedIndices ?? [])
  const activeSet = new Set(step.activeIndices ?? [])
  const sortedSet = new Set(step.sortedIndices ?? [])
  const foundSet = new Set(step.foundIndices ?? [])
  const [rangeStart, rangeEnd] = step.range ?? [0, values.length - 1]
  const maxValue = Math.max(...values, 1)

  return (
    <div className="w-full max-w-full overflow-x-auto overflow-y-hidden pb-1 scrollbar-hide">
      <div className="inline-flex min-h-[18rem] min-w-full items-end gap-2 px-1.5 pt-6 sm:min-h-[22rem] sm:gap-3 sm:px-2 sm:pt-8">
        {values.map((value, valueIndex) => {
          const isInRange = valueIndex >= rangeStart && valueIndex <= rangeEnd
          const heightPercentage = Math.max((value / maxValue) * 100, 16)

          let barClassName = "border-[#d7ccbc] bg-[#e9decd] text-[#4f4538]"

          if (!isInRange) {
            barClassName = "border-[#e7ded1] bg-[#f5efe6] text-[#9e907d]"
          }
          if (sortedSet.has(valueIndex)) {
            barClassName = "border-[#b9c8b4] bg-[#dce7d7] text-[#4b6245]"
          }
          if (comparedSet.has(valueIndex)) {
            barClassName = "border-[#d7c29d] bg-[#efdfc6] text-[#6e5430]"
          }
          if (activeSet.has(valueIndex)) {
            barClassName = "border-[#c9b18d] bg-[#e8d1b1] text-[#5a4222]"
          }
          if (foundSet.has(valueIndex)) {
            barClassName = "border-[#97b58b] bg-[#cfe1c9] text-[#35532d]"
          }

          return (
            <div key={`${value}-${valueIndex}`} className="flex min-w-[2.75rem] flex-col items-center gap-1.5 sm:min-w-[3.5rem] sm:gap-2">
              <span className="max-w-full truncate text-xs font-semibold text-[#5b5143] sm:text-sm">{value}</span>
              <div
                className={`flex w-full items-end justify-center rounded-md border text-xs font-semibold transition-all duration-300 sm:text-sm ${barClassName}`}
                style={{ height: `${heightPercentage}%`, minHeight: "3.25rem" }}
              >
                <span className="max-w-full truncate pb-2 sm:pb-3">{value}</span>
              </div>
              <span className="max-w-full truncate text-[0.55rem] uppercase tracking-[0.12em] text-[#8f8475] sm:text-[0.66rem] sm:tracking-[0.14em]">
                idx {valueIndex}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ArrayCardVisualization({
  step,
  targetValue,
}: {
  step: AlgorithmStep
  targetValue?: number
}) {
  const values = step.values ?? []
  const comparedSet = new Set(step.comparedIndices ?? [])
  const activeSet = new Set(step.activeIndices ?? [])
  const foundSet = new Set(step.foundIndices ?? [])
  const [rangeStart, rangeEnd] = step.range ?? [0, values.length - 1]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-[0.66rem] uppercase tracking-[0.14em] text-[#8f8475]">
        {typeof targetValue === "number" ? <span className="swift-chip">target {targetValue}</span> : null}
        <span className="swift-chip">range {rangeStart}–{rangeEnd}</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {values.map((value, valueIndex) => {
          const isInRange = valueIndex >= rangeStart && valueIndex <= rangeEnd
          const isCompared = comparedSet.has(valueIndex)
          const isActive = activeSet.has(valueIndex)
          const isFound = foundSet.has(valueIndex)

          let cardClassName = "border-[#d7ccbc] bg-[#f7f1e8] text-[#4f4538]"

          if (!isInRange) {
            cardClassName = "border-[#ebe2d7] bg-[#fbf7f2] text-[#a09381]"
          }
          if (isCompared) {
            cardClassName = "border-[#d7c29d] bg-[#efdfc6] text-[#6e5430]"
          }
          if (isActive) {
            cardClassName = "border-[#c9b18d] bg-[#e8d1b1] text-[#5a4222]"
          }
          if (isFound) {
            cardClassName = "border-[#97b58b] bg-[#cfe1c9] text-[#35532d]"
          }

          return (
            <div key={`${value}-${valueIndex}`} className={`rounded-lg border p-4 transition-colors ${cardClassName}`}>
              <p className="text-[0.66rem] uppercase tracking-[0.14em] opacity-70">index {valueIndex}</p>
              <p className="mt-3 text-2xl font-semibold">{value}</p>
              <p className="mt-2 text-sm leading-relaxed">
                {isFound
                  ? "target found"
                  : isActive
                    ? "currently inspecting"
                    : isCompared
                      ? "just compared"
                      : isInRange
                        ? "still in search range"
                        : "outside active range"}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function GraphVisualization({
  graph,
  step,
}: {
  graph: GraphDefinition
  step: AlgorithmStep
}) {
  const graphState = step.graphState
  const activeNodes = new Set(graphState?.activeNodeIds ?? [])
  const visitedNodes = new Set(graphState?.visitedNodeIds ?? [])
  const frontierNodes = new Set(graphState?.frontierNodeIds ?? [])
  const foundNodes = new Set(graphState?.foundNodeIds ?? [])
  const pathNodes = new Set(graphState?.pathNodeIds ?? [])
  const pathEdges = new Set(graphState?.pathEdgeIds ?? [])
  const activeEdges = new Set(graphState?.activeEdgeIds ?? [])

  return (
    <div className="space-y-4">
      <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-[#ddd2c1] bg-[radial-gradient(circle_at_top,#fbf8f2_0%,#f4ede3_60%,#f1e9dd_100%)]">
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
          {graph.edges.map((edge) => {
            const fromNode = getNodeById(graph, edge.from)
            const toNode = getNodeById(graph, edge.to)

            if (!fromNode || !toNode) {
              return null
            }

            const isPathEdge = pathEdges.has(edge.id)
            const isActiveEdge = activeEdges.has(edge.id)

            return (
              <g key={edge.id}>
                <line
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={isPathEdge ? "#5f8454" : isActiveEdge ? "#8a6b3f" : "#c8bcaa"}
                  strokeWidth={isPathEdge || isActiveEdge ? 1.6 : 1}
                  strokeLinecap="round"
                />
                {typeof edge.weight === "number" ? (
                  <text
                    x={(fromNode.x + toNode.x) / 2}
                    y={(fromNode.y + toNode.y) / 2 - 1.5}
                    textAnchor="middle"
                    fontSize="3.2"
                    fill="#7b6d5a"
                  >
                    {edge.weight}
                  </text>
                ) : null}
              </g>
            )
          })}
        </svg>

        {graph.nodes.map((node) => {
          let nodeClassName = "border-[#d4c8b8] bg-[#f7f1e8] text-[#4f4538]"

          if (frontierNodes.has(node.id)) {
            nodeClassName = "border-[#d7c29d] bg-[#efdfc6] text-[#6e5430]"
          }
          if (visitedNodes.has(node.id)) {
            nodeClassName = "border-[#b9c8b4] bg-[#dce7d7] text-[#4b6245]"
          }
          if (activeNodes.has(node.id)) {
            nodeClassName = "border-[#c9b18d] bg-[#e8d1b1] text-[#5a4222]"
          }
          if (pathNodes.has(node.id)) {
            nodeClassName = "border-[#97b58b] bg-[#cfe1c9] text-[#35532d]"
          }
          if (foundNodes.has(node.id)) {
            nodeClassName = "border-[#7ea16f] bg-[#c0dbb7] text-[#23411c]"
          }

          const distanceValue = graphState?.distances?.[node.id]

          return (
            <div
              key={node.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              <div className={`min-w-[3rem] rounded-full border px-3 py-2 text-center text-sm font-semibold shadow-sm transition-colors ${nodeClassName}`}>
                {node.label}
              </div>
              {typeof distanceValue === "number" ? (
                <div className="mt-1 rounded-full border border-[#ddd2c1] bg-[#fbf8f2] px-2 py-0.5 text-center text-[0.66rem] uppercase tracking-[0.12em] text-[#7d715f]">
                  {Number.isFinite(distanceValue) ? distanceValue : "∞"}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {graphState?.queue ? (
          <div className="rounded-md border border-[#ddd2c1] bg-[#f8f3eb] p-3">
            <p className="max-w-full truncate text-[0.55rem] uppercase tracking-[0.12em] text-[#8f8475] sm:text-[0.66rem] sm:tracking-[0.14em]">queue</p>
            <p className="mt-2 text-sm leading-relaxed text-[#4f4538]">
              {graphState.queue.length > 0 ? graphState.queue.join(" → ") : "empty"}
            </p>
          </div>
        ) : null}
        {graphState?.stack ? (
          <div className="rounded-md border border-[#ddd2c1] bg-[#f8f3eb] p-3">
            <p className="max-w-full truncate text-[0.55rem] uppercase tracking-[0.12em] text-[#8f8475] sm:text-[0.66rem] sm:tracking-[0.14em]">stack</p>
            <p className="mt-2 text-sm leading-relaxed text-[#4f4538]">
              {graphState.stack.length > 0 ? graphState.stack.join(" → ") : "empty"}
            </p>
          </div>
        ) : null}
        <div className="rounded-md border border-[#ddd2c1] bg-[#f8f3eb] p-3">
          <p className="max-w-full truncate text-[0.55rem] uppercase tracking-[0.12em] text-[#8f8475] sm:text-[0.66rem] sm:tracking-[0.14em]">current node</p>
          <p className="mt-2 text-sm leading-relaxed text-[#4f4538]">
            {graphState?.currentNodeId ?? "none"}
          </p>
        </div>
      </div>
    </div>
  )
}

function AlgorithmRunPanel({
  algorithmDefinition,
  panelLabel,
  sharedValues,
  sharedTargetValue,
  graphTargetNodeId,
  quizMode,
}: {
  algorithmDefinition: AlgorithmDefinition
  panelLabel?: string
  sharedValues: number[]
  sharedTargetValue: number
  graphTargetNodeId: string
  quizMode: boolean
}) {
  const normalizedValues = useMemo(
    () => normalizeValuesForAlgorithm(algorithmDefinition, sharedValues),
    [algorithmDefinition, sharedValues],
  )

  const steps = useMemo(
    () =>
      algorithmDefinition.createSteps({
        values: normalizedValues,
        targetValue: sharedTargetValue,
        graph: algorithmDefinition.graph,
        targetNodeId: graphTargetNodeId,
      }),
    [algorithmDefinition, graphTargetNodeId, normalizedValues, sharedTargetValue],
  )

  const [stepIndex, setStepIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [intervalMs, setIntervalMs] = useState<number>(speedOptions[1].intervalMs)
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<string | null>(null)
  const touchStartXRef = useRef<number | null>(null)
  const touchStartYRef = useRef<number | null>(null)

  const currentStep = steps[Math.min(stepIndex, Math.max(steps.length - 1, 0))]
  const finalStep = steps[steps.length - 1]
  const progressPercentage = steps.length > 1 ? Math.round((stepIndex / (steps.length - 1)) * 100) : 100
  const quiz = useMemo(
    () => getNextQuiz(algorithmDefinition, steps, stepIndex),
    [algorithmDefinition, stepIndex, steps],
  )

  useEffect(() => {
    setStepIndex(0)
    setIsPlaying(false)
    setSelectedQuizAnswer(null)
  }, [algorithmDefinition, graphTargetNodeId, normalizedValues, sharedTargetValue])

  useEffect(() => {
    setSelectedQuizAnswer(null)
  }, [quizMode, stepIndex])

  useEffect(() => {
    if (quizMode && isPlaying) {
      setIsPlaying(false)
    }
  }, [isPlaying, quizMode])

  useEffect(() => {
    if (!isPlaying || quizMode || steps.length === 0) {
      return
    }

    if (stepIndex >= steps.length - 1) {
      setIsPlaying(false)
      return
    }

    const timer = window.setTimeout(() => {
      setStepIndex((currentValue) => Math.min(currentValue + 1, steps.length - 1))
    }, intervalMs)

    return () => window.clearTimeout(timer)
  }, [intervalMs, isPlaying, quizMode, stepIndex, steps.length])

  if (!currentStep || !finalStep) {
    return null
  }

  const metricEntries = metricDefinitions.filter(
    (metricDefinition) =>
      typeof currentStep.metrics?.[metricDefinition.key] === "number" ||
      typeof finalStep.metrics?.[metricDefinition.key] === "number",
  )
  const scrubberStyle = { "--alg-progress": `${progressPercentage}%` } as CSSProperties
  const counterGridStyle = {
    gridTemplateColumns: "repeat(auto-fit, minmax(7rem, 1fr))",
  } as CSSProperties

  const normalizedInputChanged =
    algorithmDefinition.datasetKind === "array" &&
    algorithmDefinition.requiresSortedInput &&
    !arraysEqual(normalizedValues, sharedValues)

  const handlePrevious = () => {
    setIsPlaying(false)
    setStepIndex((currentValue) => Math.max(currentValue - 1, 0))
  }

  const handleNext = () => {
    setIsPlaying(false)
    setStepIndex((currentValue) => Math.min(currentValue + 1, steps.length - 1))
  }

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = event.changedTouches[0]?.clientX ?? null
    touchStartYRef.current = event.changedTouches[0]?.clientY ?? null
  }

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const startX = touchStartXRef.current
    const startY = touchStartYRef.current
    const endX = event.changedTouches[0]?.clientX ?? null
    const endY = event.changedTouches[0]?.clientY ?? null

    if (startX === null || startY === null || endX === null || endY === null) {
      return
    }

    const deltaX = endX - startX
    const deltaY = endY - startY

    if (Math.abs(deltaX) < 42 || Math.abs(deltaX) <= Math.abs(deltaY)) {
      return
    }

    if (deltaX < 0) {
      handleNext()
      return
    }

    handlePrevious()
  }

  return (
    <section className="min-w-0 swift-surface-strong rounded-lg p-5 sm:p-6 space-y-5">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {panelLabel ? <span className="swift-chip">{panelLabel}</span> : null}
          <span className="text-[0.68rem] uppercase tracking-[0.14em] text-[#8f8475]">
            {formatCategoryLabel(algorithmDefinition.category)}
          </span>
          <span className="swift-chip">{formatDifficultyLabel(algorithmDefinition.difficulty)}</span>
          <span className="swift-chip">best {algorithmDefinition.complexity.best}</span>
          <span className="swift-chip">worst {algorithmDefinition.complexity.worst}</span>
          <span className="swift-chip">space {algorithmDefinition.complexity.space}</span>
        </div>

        <div className="space-y-2">
          <h2 className="aman-display text-[1.55rem] sm:text-[1.8rem] leading-none text-[#3b342c]">
            {algorithmDefinition.name}
          </h2>
          <p className="text-sm leading-relaxed text-[#554b3e]">{algorithmDefinition.description}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {algorithmDefinition.concepts.map((concept) => (
            <span key={concept} className="swift-chip normal-case tracking-normal font-medium">
              {concept}
            </span>
          ))}
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setIsPlaying((currentlyPlaying) => !currentlyPlaying)}
          disabled={quizMode}
          className={controlClassName}
        >
          {isPlaying ? "pause" : "play"}
        </button>
        <button type="button" onClick={handlePrevious} disabled={stepIndex === 0} className={controlClassName}>
          prev
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={stepIndex === steps.length - 1}
          className={controlClassName}
        >
          next
        </button>
        <button
          type="button"
          onClick={() => {
            setIsPlaying(false)
            setStepIndex(0)
          }}
          className={controlClassName}
        >
          reset
        </button>
        <div className="flex flex-wrap items-center gap-2 pl-1">
          {speedOptions.map((speedOption) => {
            const isActive = speedOption.intervalMs === intervalMs

            return (
              <button
                key={speedOption.label}
                type="button"
                onClick={() => setIntervalMs(speedOption.intervalMs)}
                className={`rounded-md border px-3 py-2 text-[0.68rem] uppercase tracking-[0.12em] transition-colors ${
                  isActive
                    ? "border-[#b3997a] bg-[#eadfcd] text-[#3f3528]"
                    : "border-[#d7ccbc] bg-[#f6f1e8] text-[#5b5143] hover:bg-[#eee5d7]"
                }`}
              >
                {speedOption.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-[0.68rem] uppercase tracking-[0.14em] text-[#8f8475]">
          <span>
            step {stepIndex + 1} / {steps.length}
          </span>
          <span>{progressPercentage}% complete</span>
          {quizMode ? <span>quiz mode pauses autoplay</span> : null}
        </div>
        <input
          type="range"
          min={0}
          max={Math.max(steps.length - 1, 0)}
          value={stepIndex}
          onChange={(event) => {
            setIsPlaying(false)
            setStepIndex(Number(event.target.value))
          }}
          className="alg-scrubber w-full"
          style={scrubberStyle}
        />
      </div>

      {normalizedInputChanged ? (
        <div className="rounded-md border border-[#ddd2c1] bg-[#f8f3eb] p-3 text-sm leading-relaxed text-[#4f4538]">
          This algorithm requires sorted input, so the visualizer is using a sorted copy of your dataset:
          <span className="font-medium"> {normalizedValues.join(", ")}</span>
        </div>
      ) : null}

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[0.68rem] uppercase tracking-[0.14em] text-[#8f8475]">chart + counters</p>
            <p className="text-sm leading-relaxed text-[#554b3e]">The visualization and the live counters stay together so each step is easier to read.</p>
          </div>
          <p className="w-full break-words text-[0.64rem] uppercase tracking-[0.12em] text-[#8f8475] sm:w-auto sm:text-[0.68rem] sm:tracking-[0.14em] [overflow-wrap:anywhere]">current action · {currentStep.actionLabel}</p>
        </div>

        <div className="grid gap-2 overflow-hidden" style={counterGridStyle}>
          {metricEntries.map((metricDefinition) => {
            const currentValue = currentStep.metrics?.[metricDefinition.key]
            const finalValue = finalStep.metrics?.[metricDefinition.key]

            return (
              <div className="min-w-0 rounded-md border border-[#ddd2c1] bg-[#f8f3eb] px-2 py-1.5 md:flex md:min-h-[3.75rem] md:flex-col md:justify-between" key={metricDefinition.key}>
                <p className="break-words text-[0.48rem] leading-tight uppercase tracking-[0.08em] text-[#8f8475] [overflow-wrap:anywhere] md:text-[0.58rem] md:tracking-[0.1em] xl:text-[0.64rem]">
                  {metricDefinition.label}
                </p>
                <div className="mt-1 md:mt-0 md:self-end md:text-right">
                  <p className="text-[0.85rem] font-semibold leading-tight text-[#3f3528] md:text-[1rem] xl:text-[1.12rem]">
                    {formatMetricValue(currentValue)}
                  </p>
                  {typeof finalValue === "number" ? (
                    <p className="mt-1 text-[0.48rem] leading-tight uppercase tracking-[0.08em] text-[#756a5d] md:text-[0.56rem] xl:text-[0.62rem]">
                      final {formatMetricValue(finalValue)}
                    </p>
                  ) : null}
                </div>
              </div>
            )
          })}
          <div className="min-w-0 rounded-md border border-[#ddd2c1] bg-[#f8f3eb] px-2 py-1.5 md:flex md:min-h-[3.75rem] md:flex-col md:justify-between">
            <p className="break-words text-[0.48rem] leading-tight uppercase tracking-[0.08em] text-[#8f8475] [overflow-wrap:anywhere] md:text-[0.58rem] md:tracking-[0.1em] xl:text-[0.64rem]">steps</p>
            <div className="mt-1 md:mt-0 md:self-end md:text-right">
              <p className="text-[0.85rem] font-semibold leading-tight text-[#3f3528] md:text-[1rem] xl:text-[1.12rem]">
                {stepIndex + 1} / {steps.length}
              </p>
            </div>
          </div>
        </div>

        <div className="min-w-0 swift-surface rounded-lg p-4 sm:p-5" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          {algorithmDefinition.visualMode === "bars" ? (
            <ArrayBarVisualization step={currentStep} />
          ) : null}
          {algorithmDefinition.visualMode === "cards" ? (
            <ArrayCardVisualization step={currentStep} targetValue={sharedTargetValue} />
          ) : null}
          {algorithmDefinition.visualMode === "graph" && algorithmDefinition.graph ? (
            <GraphVisualization graph={algorithmDefinition.graph} step={currentStep} />
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="swift-surface rounded-lg p-5 space-y-4">
          <div className="space-y-1.5">
            <h3 className="text-[0.68rem] uppercase tracking-[0.14em] text-[#8f8475]">current explanation</h3>
            <p className="text-sm leading-relaxed text-[#4f4538]">{currentStep.message}</p>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-[0.68rem] uppercase tracking-[0.14em] text-[#8f8475]">simple explanation</h3>
            <p className="text-sm leading-relaxed text-[#554b3e]">{currentStep.simpleExplanation}</p>
          </div>

          {quizMode && quiz ? (
            <div className="rounded-lg border border-[#ddd2c1] bg-[#f8f3eb] p-4 space-y-3">
              <div className="space-y-1">
                <p className="text-[0.68rem] uppercase tracking-[0.14em] text-[#8f8475]">quiz mode</p>
                <p className="text-sm leading-relaxed text-[#4f4538]">{quiz.question}</p>
              </div>
              <div className="grid gap-2">
                {quiz.options.map((option) => {
                  const isSelected = selectedQuizAnswer === option
                  const isCorrect = option === quiz.correctAnswer

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSelectedQuizAnswer(option)}
                      className={`rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                        isSelected
                          ? isCorrect
                            ? "border-[#97b58b] bg-[#dce7d7] text-[#35532d]"
                            : "border-[#d9bdb9] bg-[#f2e5e3] text-[#914840]"
                          : "border-[#d7ccbc] bg-[#fbf8f2] text-[#4f4538] hover:bg-[#f1eadf]"
                      }`}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>
              {selectedQuizAnswer ? (
                <p className="text-sm leading-relaxed text-[#554b3e]">
                  {selectedQuizAnswer === quiz.correctAnswer
                    ? "Nice — that is the next action in the trace."
                    : `Close. The next action is “${quiz.correctAnswer}”.`}
                </p>
              ) : null}
            </div>
          ) : null}

        </section>

        <section className="swift-surface rounded-lg p-5 space-y-4">
          <div className="space-y-1.5">
            <h3 className="text-[0.68rem] uppercase tracking-[0.14em] text-[#8f8475]">pseudocode</h3>
            <div className="rounded-md border border-[#ddd2c1] bg-[#f4ece0] p-4 font-mono text-[0.8rem] leading-7 text-[#4b4033]">
              {algorithmDefinition.pseudocode.map((line, lineIndex) => {
                const isActive = lineIndex + 1 === currentStep.pseudocodeLine

                return (
                  <div
                    key={`${algorithmDefinition.id}-${line}`}
                    className={`flex gap-3 rounded-md px-2 ${isActive ? "bg-[#eadfcd] text-[#3f3528]" : ""}`}
                  >
                    <span className="select-none text-[#9a8873]">{lineIndex + 1}</span>
                    <span>{line}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-md border border-[#ddd2c1] bg-[#f8f3eb] p-4 space-y-3">
            <h3 className="text-[0.68rem] uppercase tracking-[0.14em] text-[#8f8475]">complexity card</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <p className="text-[0.66rem] uppercase tracking-[0.12em] text-[#8f8475]">best</p>
                <p className="text-sm text-[#4f4538]">{algorithmDefinition.complexity.best}</p>
              </div>
              <div>
                <p className="text-[0.66rem] uppercase tracking-[0.12em] text-[#8f8475]">average</p>
                <p className="text-sm text-[#4f4538]">{algorithmDefinition.complexity.average}</p>
              </div>
              <div>
                <p className="text-[0.66rem] uppercase tracking-[0.12em] text-[#8f8475]">worst</p>
                <p className="text-sm text-[#4f4538]">{algorithmDefinition.complexity.worst}</p>
              </div>
              <div>
                <p className="text-[0.66rem] uppercase tracking-[0.12em] text-[#8f8475]">space</p>
                <p className="text-sm text-[#4f4538]">{algorithmDefinition.complexity.space}</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="swift-surface rounded-lg p-5 space-y-4">
        <h3 className="text-[0.68rem] uppercase tracking-[0.14em] text-[#8f8475]">algorithm notes</h3>
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="space-y-3">
            <div className="rounded-md border border-[#ddd2c1] bg-[#f8f3eb] p-4">
              <p className="max-w-full truncate text-[0.55rem] uppercase tracking-[0.12em] text-[#8f8475] sm:text-[0.66rem] sm:tracking-[0.14em]">intuition</p>
              <p className="mt-2 text-sm leading-relaxed text-[#4f4538]">{algorithmDefinition.notes.intuition}</p>
            </div>
            <div className="rounded-md border border-[#ddd2c1] bg-[#f8f3eb] p-4">
              <p className="max-w-full truncate text-[0.55rem] uppercase tracking-[0.12em] text-[#8f8475] sm:text-[0.66rem] sm:tracking-[0.14em]">tradeoffs</p>
              <ul className="mt-2 list-disc pl-5 space-y-1 text-sm leading-relaxed text-[#4f4538]">
                {algorithmDefinition.notes.tradeoffs.map((tradeoff) => (
                  <li key={tradeoff}>{tradeoff}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="space-y-3">
            <div className="rounded-md border border-[#ddd2c1] bg-[#f8f3eb] p-4">
              <p className="max-w-full truncate text-[0.55rem] uppercase tracking-[0.12em] text-[#8f8475] sm:text-[0.66rem] sm:tracking-[0.14em]">when to use it</p>
              <p className="mt-2 text-sm leading-relaxed text-[#4f4538]">{algorithmDefinition.notes.whenToUse}</p>
            </div>
            <div className="rounded-md border border-[#ddd2c1] bg-[#f8f3eb] p-4">
              <p className="max-w-full truncate text-[0.55rem] uppercase tracking-[0.12em] text-[#8f8475] sm:text-[0.66rem] sm:tracking-[0.14em]">interview tips</p>
              <ul className="mt-2 list-disc pl-5 space-y-1 text-sm leading-relaxed text-[#4f4538]">
                {algorithmDefinition.notes.interviewTips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </section>
  )
}

export default function AlgorithmVisualizer() {
  const pathname = usePathname() ?? "/alg"
  const router = useRouter()
  const defaultPrimaryId = getPrimaryDefaultId()
  const defaultPrimaryDefinition = algorithmCatalogById[defaultPrimaryId]
  const defaultArrayValues = getDefaultArrayValues(defaultPrimaryDefinition)
  const [hasHydrated, setHasHydrated] = useState(false)
  const [selectedAlgorithmId, setSelectedAlgorithmId] = useState(defaultPrimaryId)
  const [secondaryAlgorithmId, setSecondaryAlgorithmId] = useState("")
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all")
  const [groupBy, setGroupBy] = useState<GroupBy>("category")
  const [isCompareMode, setIsCompareMode] = useState(false)
  const [quizMode, setQuizMode] = useState(false)
  const [arrayDraftText, setArrayDraftText] = useState(defaultArrayValues.join(", "))
  const [appliedArrayValues, setAppliedArrayValues] = useState(defaultArrayValues)
  const [targetDraftValue, setTargetDraftValue] = useState(String(getDefaultTargetValue(defaultPrimaryDefinition)))
  const [appliedTargetValue, setAppliedTargetValue] = useState(getDefaultTargetValue(defaultPrimaryDefinition))
  const [graphTargetNodeId, setGraphTargetNodeId] = useState(graphTargetOptions[graphTargetOptions.length - 1]?.value ?? "G")
  const [inputFeedback, setInputFeedback] = useState<string | null>(null)
  const [shareableUrlFeedback, setShareableUrlFeedback] = useState<string | null>(null)

  useEffect(() => {
    const storedState = readPersistedState()
    const query = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "")
    const primaryId = isValidAlgorithmId(query.get("alg"))
      ? (query.get("alg") as string)
      : isValidAlgorithmId(storedState?.selectedAlgorithmId)
        ? (storedState?.selectedAlgorithmId as string)
        : defaultPrimaryId
    const primaryDefinition = algorithmCatalogById[primaryId] ?? defaultPrimaryDefinition
    const compareCandidates = primaryDefinition ? getCompareCandidates(primaryDefinition) : []
    const filterValue = isValidFilterValue(query.get("filter"))
      ? (query.get("filter") as FilterValue)
      : isValidFilterValue(storedState?.activeFilter)
        ? (storedState?.activeFilter as FilterValue)
        : "all"
    const groupValue = isValidGroupValue(query.get("group"))
      ? (query.get("group") as GroupBy)
      : isValidGroupValue(storedState?.groupBy)
        ? (storedState?.groupBy as GroupBy)
        : "category"
    const compareValue = query.get("compare") === "1" || storedState?.isCompareMode === true
    const quizValue = query.get("quiz") === "1" || storedState?.quizMode === true
    const parsedValues = parseArrayInput(query.get("data") ?? storedState?.arrayValues?.join(", ") ?? "")
    const arrayValues = parsedValues.length > 0 ? parsedValues : getDefaultArrayValues(primaryDefinition)
    const targetValue = Number(query.get("target") ?? storedState?.targetValue ?? getDefaultTargetValue(primaryDefinition))
    const safeTargetValue = Number.isFinite(targetValue) ? Math.max(1, Math.min(99, Math.round(targetValue))) : getDefaultTargetValue(primaryDefinition)
    const safeGraphTarget = isValidGraphTarget(query.get("nodeTarget"))
      ? (query.get("nodeTarget") as string)
      : isValidGraphTarget(storedState?.graphTargetNodeId)
        ? (storedState?.graphTargetNodeId as string)
        : primaryDefinition?.graph?.defaultTargetNodeId ?? graphTargetOptions[graphTargetOptions.length - 1]?.value ?? "G"
    const requestedSecondaryId = isValidAlgorithmId(query.get("secondary"))
      ? (query.get("secondary") as string)
      : isValidAlgorithmId(storedState?.secondaryAlgorithmId)
        ? (storedState?.secondaryAlgorithmId as string)
        : compareCandidates[0]?.id ?? ""
    const safeSecondaryId = compareCandidates.some((algorithmDefinition) => algorithmDefinition.id === requestedSecondaryId)
      ? requestedSecondaryId
      : compareCandidates[0]?.id ?? ""

    setSelectedAlgorithmId(primaryId)
    setSecondaryAlgorithmId(safeSecondaryId)
    setActiveFilter(filterValue)
    setGroupBy(groupValue)
    setIsCompareMode(compareValue && compareCandidates.length > 0)
    setQuizMode(quizValue)
    setAppliedArrayValues(arrayValues)
    setArrayDraftText(arrayValues.join(", "))
    setAppliedTargetValue(safeTargetValue)
    setTargetDraftValue(String(safeTargetValue))
    setGraphTargetNodeId(safeGraphTarget)
    setHasHydrated(true)
  }, [defaultPrimaryDefinition, defaultPrimaryId])

  const filteredAlgorithms = useMemo(
    () =>
      activeFilter === "all"
        ? algorithmCatalog
        : algorithmCatalog.filter((algorithmDefinition) => algorithmDefinition.category === activeFilter),
    [activeFilter],
  )

  useEffect(() => {
    if (
      filteredAlgorithms.length > 0 &&
      !filteredAlgorithms.some((algorithmDefinition) => algorithmDefinition.id === selectedAlgorithmId)
    ) {
      setSelectedAlgorithmId(filteredAlgorithms[0].id)
    }
  }, [filteredAlgorithms, selectedAlgorithmId])

  const primaryAlgorithm = useMemo(
    () =>
      filteredAlgorithms.find((algorithmDefinition) => algorithmDefinition.id === selectedAlgorithmId) ??
      filteredAlgorithms[0] ??
      defaultPrimaryDefinition,
    [defaultPrimaryDefinition, filteredAlgorithms, selectedAlgorithmId],
  )

  const availableCompareAlgorithms = useMemo(
    () => (primaryAlgorithm ? getCompareCandidates(primaryAlgorithm) : []),
    [primaryAlgorithm],
  )

  useEffect(() => {
    if (!primaryAlgorithm) {
      return
    }

    if (availableCompareAlgorithms.length === 0) {
      setIsCompareMode(false)
      setSecondaryAlgorithmId("")
      return
    }

    if (!availableCompareAlgorithms.some((algorithmDefinition) => algorithmDefinition.id === secondaryAlgorithmId)) {
      setSecondaryAlgorithmId(availableCompareAlgorithms[0].id)
    }
  }, [availableCompareAlgorithms, primaryAlgorithm, secondaryAlgorithmId])

  const secondaryAlgorithm = useMemo(
    () =>
      availableCompareAlgorithms.find((algorithmDefinition) => algorithmDefinition.id === secondaryAlgorithmId) ??
      availableCompareAlgorithms[0],
    [availableCompareAlgorithms, secondaryAlgorithmId],
  )

  useEffect(() => {
    if (!hasHydrated || !primaryAlgorithm) {
      return
    }

    const persistedState: PersistedState = {
      activeFilter,
      groupBy,
      selectedAlgorithmId: primaryAlgorithm.id,
      secondaryAlgorithmId: secondaryAlgorithm?.id,
      isCompareMode,
      quizMode,
      arrayValues: appliedArrayValues,
      targetValue: appliedTargetValue,
      graphTargetNodeId,
    }

    window.localStorage.setItem(storageKey, JSON.stringify(persistedState))

    const nextParams = new URLSearchParams()
    nextParams.set("alg", primaryAlgorithm.id)

    if (activeFilter !== "all") {
      nextParams.set("filter", activeFilter)
    }
    if (groupBy !== "none") {
      nextParams.set("group", groupBy)
    }
    if (isCompareMode && secondaryAlgorithm) {
      nextParams.set("compare", "1")
      nextParams.set("secondary", secondaryAlgorithm.id)
    }
    if (quizMode) {
      nextParams.set("quiz", "1")
    }
    nextParams.set("data", appliedArrayValues.join(","))
    nextParams.set("target", String(appliedTargetValue))
    nextParams.set("nodeTarget", graphTargetNodeId)

    const nextQueryString = nextParams.toString()
    const nextUrl = nextQueryString ? `${pathname}?${nextQueryString}` : pathname
    const currentUrl = `${pathname}${typeof window !== "undefined" ? window.location.search : ""}`

    if (nextUrl !== currentUrl) {
      router.replace(nextUrl, { scroll: false })
    }
  }, [
    activeFilter,
    appliedArrayValues,
    appliedTargetValue,
    graphTargetNodeId,
    groupBy,
    hasHydrated,
    isCompareMode,
    pathname,
    primaryAlgorithm,
    quizMode,
    router,
    secondaryAlgorithm,
  ])

  const groupedAlgorithms = useMemo(() => {
    if (groupBy === "none") {
      return [{ key: "all", label: "all algorithms", items: filteredAlgorithms }]
    }

    const groups = new Map<string, AlgorithmDefinition[]>()

    for (const algorithmDefinition of filteredAlgorithms) {
      const groupKey =
        groupBy === "category"
          ? formatCategoryLabel(algorithmDefinition.category)
          : formatDifficultyLabel(algorithmDefinition.difficulty)
      const existingAlgorithms = groups.get(groupKey) ?? []
      groups.set(groupKey, [...existingAlgorithms, algorithmDefinition])
    }

    return Array.from(groups.entries()).map(([key, items]) => ({ key, label: key, items }))
  }, [filteredAlgorithms, groupBy])

  const showArrayControls = primaryAlgorithm?.datasetKind === "array"
  const showNumberTargetControl =
    primaryAlgorithm?.targetType === "number" || (isCompareMode && secondaryAlgorithm?.targetType === "number")
  const showNodeTargetControl =
    primaryAlgorithm?.targetType === "node" || (isCompareMode && secondaryAlgorithm?.targetType === "node")
  const currentShareableUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${window.location.pathname}${window.location.search}`
      : `${pathname}`

  const copyShareableUrl = async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
      setShareableUrlFeedback("Copy failed. Please copy the URL manually.")
      return
    }

    try {
      await navigator.clipboard.writeText(currentShareableUrl)
      setShareableUrlFeedback("URL copied to clipboard.")
    } catch {
      setShareableUrlFeedback("Copy failed. Please copy the URL manually.")
    }
  }

  const applyArrayInput = () => {
    const parsedValues = parseArrayInput(arrayDraftText)

    if (parsedValues.length < 3) {
      setInputFeedback("Enter at least 3 integers so the visualization has enough steps.")
      return
    }

    setAppliedArrayValues(parsedValues)
    setArrayDraftText(parsedValues.join(", "))
    setInputFeedback("Custom dataset applied.")
  }

  const resetArrayInput = () => {
    const nextValues = getDefaultArrayValues(primaryAlgorithm)
    const nextTargetValue = getDefaultTargetValue(primaryAlgorithm)

    setAppliedArrayValues(nextValues)
    setArrayDraftText(nextValues.join(", "))
    setAppliedTargetValue(nextTargetValue)
    setTargetDraftValue(String(nextTargetValue))
    setGraphTargetNodeId(primaryAlgorithm?.graph?.defaultTargetNodeId ?? graphTargetOptions[graphTargetOptions.length - 1]?.value ?? "G")
    setInputFeedback("Defaults restored for the current algorithm.")
  }

  const randomizeDataset = () => {
    const nextValues = randomArrayValues(Math.max(Math.min(appliedArrayValues.length, 10), 6))
    setAppliedArrayValues(nextValues)
    setArrayDraftText(nextValues.join(", "))
    setInputFeedback("Random dataset generated.")
  }

  const applyTargetValue = () => {
    const parsedTarget = Number(targetDraftValue)

    if (!Number.isFinite(parsedTarget)) {
      setInputFeedback("Target must be a valid integer.")
      return
    }

    const nextTargetValue = Math.max(1, Math.min(99, Math.round(parsedTarget)))
    setAppliedTargetValue(nextTargetValue)
    setTargetDraftValue(String(nextTargetValue))
    setInputFeedback("Target updated.")
  }

  const resetGraphTarget = () => {
    const nextTarget = primaryAlgorithm?.graph?.defaultTargetNodeId ?? graphTargetOptions[graphTargetOptions.length - 1]?.value ?? "G"
    setGraphTargetNodeId(nextTarget)
    setInputFeedback("Graph target reset.")
  }

  if (!primaryAlgorithm) {
    return null
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="swift-surface rounded-lg p-4 sm:p-5 space-y-4">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <p className="text-[0.68rem] uppercase tracking-[0.14em] text-[#8f8475]">algorithm catalog</p>
            <p className="text-sm leading-relaxed text-[#554b3e]">
              Choose a lane, pick a grouping, then replay the algorithm you want.
            </p>
          </div>
          <p className="text-[0.68rem] uppercase tracking-[0.14em] text-[#8f8475]">
            showing {filteredAlgorithms.length} algorithm{filteredAlgorithms.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.2fr_1.05fr_0.9fr]">
          <SegmentedControl label="filter" value={activeFilter} options={filterOptions} onChange={setActiveFilter} />
          <SegmentedControl label="group" value={groupBy} options={groupOptions} onChange={setGroupBy} />
          <div className="space-y-2">
            <p className="max-w-full truncate text-[0.55rem] uppercase tracking-[0.12em] text-[#8f8475] sm:text-[0.66rem] sm:tracking-[0.14em]">modes</p>
            <div className="flex flex-wrap gap-2">
              <ToggleControl
                label="compare"
                enabled={isCompareMode}
                disabled={availableCompareAlgorithms.length === 0}
                onToggle={() => setIsCompareMode((currentValue) => !currentValue)}
              />
              <ToggleControl
                label="quiz"
                enabled={quizMode}
                onToggle={() => setQuizMode((currentValue) => !currentValue)}
              />
            </div>
          </div>
        </div>

        {isCompareMode && secondaryAlgorithm ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-[#ddd2c1] bg-[#f8f3eb] p-3">
              <p className="max-w-full truncate text-[0.55rem] uppercase tracking-[0.12em] text-[#8f8475] sm:text-[0.66rem] sm:tracking-[0.14em]">compare against</p>
              <select
                value={secondaryAlgorithm.id}
                onChange={(event) => setSecondaryAlgorithmId(event.target.value)}
                className="mt-2 w-full rounded-md border border-[#d7ccbc] bg-[#fbf8f2] px-3 py-2 text-sm text-[#4f4538] outline-none transition-colors hover:bg-[#f2eadf] focus:border-[#b99e78]"
              >
                {availableCompareAlgorithms.map((algorithmDefinition) => (
                  <option key={algorithmDefinition.id} value={algorithmDefinition.id}>
                    {algorithmDefinition.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="rounded-md border border-[#ddd2c1] bg-[#f8f3eb] p-3">
              <p className="max-w-full truncate text-[0.55rem] uppercase tracking-[0.12em] text-[#8f8475] sm:text-[0.66rem] sm:tracking-[0.14em]">current shareable URL</p>
              <button
                type="button"
                onClick={() => void copyShareableUrl()}
                className="mt-2 w-full rounded-md border border-[#d7ccbc] bg-[#fbf8f2] px-3 py-2 text-left text-sm leading-relaxed text-[#4f4538] transition-colors hover:bg-[#f2eadf] focus:border-[#b99e78] focus:outline-none"
              >
                <span className="break-all">{currentShareableUrl}</span>
              </button>
              <p className="mt-2 text-xs leading-relaxed text-[#7b6f61]">
                {shareableUrlFeedback ?? "Click the URL to copy it to your clipboard."}
              </p>
            </div>
          </div>
        ) : null}

      </section>

      {showArrayControls ? (
        <section className="swift-surface rounded-lg p-5 space-y-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-1">
              <p className="text-[0.68rem] uppercase tracking-[0.14em] text-[#8f8475]">dataset controls</p>
              <p className="max-w-2xl text-sm leading-relaxed text-[#554b3e]">
                Use your own array, randomize a fresh one, or restore defaults. The same dataset is shared by both panels in compare mode.
              </p>
            </div>
            {inputFeedback ? <p className="text-sm leading-relaxed text-[#5f5446]">{inputFeedback}</p> : null}
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
            <div className="space-y-3">
              <label className="flex flex-col gap-1.5 text-[0.68rem] uppercase tracking-[0.14em] text-[#8f8475]">
                <span>array input</span>
                <textarea
                  rows={3}
                  value={arrayDraftText}
                  onChange={(event) => setArrayDraftText(event.target.value)}
                  className="rounded-md border border-[#d7ccbc] bg-[#fbf8f2] px-3 py-2 text-sm leading-relaxed text-[#4f4538] outline-none transition-colors focus:border-[#b99e78]"
                  placeholder="8, 3, 5, 1, 9, 6, 2, 7"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={applyArrayInput} className={controlClassName}>
                  apply input
                </button>
                <button type="button" onClick={randomizeDataset} className={controlClassName}>
                  randomize
                </button>
                <button type="button" onClick={resetArrayInput} className={controlClassName}>
                  reset defaults
                </button>
              </div>
              <p className="text-sm leading-relaxed text-[#5f5446]">
                Enter up to 12 integers. Values are normalized to the range 1–99 for clean visualization.
              </p>
            </div>

            <div className="space-y-3">
              {showNumberTargetControl ? (
                <div className="rounded-md border border-[#ddd2c1] bg-[#f8f3eb] p-4 space-y-3">
                  <label className="flex flex-col gap-1.5 text-[0.68rem] uppercase tracking-[0.14em] text-[#8f8475]">
                    <span>target value</span>
                    <input
                      value={targetDraftValue}
                      onChange={(event) => setTargetDraftValue(event.target.value)}
                      className="rounded-md border border-[#d7ccbc] bg-[#fbf8f2] px-3 py-2 text-sm text-[#4f4538] outline-none transition-colors focus:border-[#b99e78]"
                    />
                  </label>
                  <button type="button" onClick={applyTargetValue} className={controlClassName}>
                    apply target
                  </button>
                </div>
              ) : null}

            </div>
          </div>
        </section>
      ) : (
        <section className="swift-surface rounded-lg p-5 space-y-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-1">
              <p className="text-[0.68rem] uppercase tracking-[0.14em] text-[#8f8475]">graph controls</p>
              <p className="max-w-2xl text-sm leading-relaxed text-[#554b3e]">
                Graph algorithms reuse the same learning graph so you can compare traversal and shortest-path behavior side by side.
              </p>
            </div>
            {inputFeedback ? <p className="text-sm leading-relaxed text-[#5f5446]">{inputFeedback}</p> : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {showNodeTargetControl ? (
              <div className="rounded-md border border-[#ddd2c1] bg-[#f8f3eb] p-4 space-y-3">
                <label className="flex flex-col gap-1.5 text-[0.68rem] uppercase tracking-[0.14em] text-[#8f8475]">
                  <span>target node</span>
                  <select
                    value={graphTargetNodeId}
                    onChange={(event) => setGraphTargetNodeId(event.target.value)}
                    className="rounded-md border border-[#d7ccbc] bg-[#fbf8f2] px-3 py-2 text-sm text-[#4f4538] outline-none transition-colors focus:border-[#b99e78]"
                  >
                    {graphTargetOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <button type="button" onClick={resetGraphTarget} className={controlClassName}>
                  reset target
                </button>
              </div>
            ) : null}

            <div className="rounded-md border border-[#ddd2c1] bg-[#f8f3eb] p-4 space-y-2">
              <p className="max-w-full truncate text-[0.55rem] uppercase tracking-[0.12em] text-[#8f8475] sm:text-[0.66rem] sm:tracking-[0.14em]">graph note</p>
              <p className="text-sm leading-relaxed text-[#4f4538]">
                BFS and DFS focus on exploration order. Dijkstra adds weighted edge relaxations and shortest-path costs.
              </p>
            </div>
          </div>
        </section>
      )}

      <div className="space-y-5 sm:space-y-6">
        {groupedAlgorithms.map((group) => (
          <section key={group.key} className="swift-surface rounded-lg p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="aman-display text-[1.2rem] text-[#3b342c] uppercase">
                {groupBy === "none" ? "algorithm list" : group.label}
              </h2>
              <span className="text-[0.68rem] uppercase tracking-[0.14em] text-[#8f8475]">
                {group.items.length} algorithm{group.items.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {group.items.map((algorithmDefinition) => {
                const isSelected = algorithmDefinition.id === primaryAlgorithm.id

                return (
                  <button
                    key={algorithmDefinition.id}
                    type="button"
                    onClick={() => setSelectedAlgorithmId(algorithmDefinition.id)}
                    className={`rounded-lg border p-4 text-left transition-all ${
                      isSelected
                        ? "border-[#baa487] bg-[#f7efe1] shadow-[0_1.25rem_2rem_-1.5rem_rgba(30,24,17,0.45)]"
                        : "border-[#d8cebf] bg-[#fbf7f0] hover:border-[#c7b69b] hover:bg-[#f7f1e6]"
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[0.62rem] uppercase tracking-[0.14em] text-[#8f8475]">
                          {formatCategoryLabel(algorithmDefinition.category)}
                        </span>
                        <span className="swift-chip">{formatDifficultyLabel(algorithmDefinition.difficulty)}</span>
                        <span className="swift-chip">{algorithmDefinition.complexity.worst}</span>
                      </div>
                      <div className="space-y-1.5">
                        <h3 className="aman-display text-[1.3rem] leading-tight text-[#3b342c]">
                          {algorithmDefinition.name}
                        </h3>
                        <p className="text-sm leading-relaxed text-[#5f5446]">
                          {algorithmDefinition.description}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>
        ))}
      </div>

      <div className={isCompareMode && secondaryAlgorithm ? "grid gap-4 2xl:grid-cols-2" : "space-y-4"}>
        <AlgorithmRunPanel
          key={`primary-${primaryAlgorithm.id}-${appliedArrayValues.join(",")}-${appliedTargetValue}-${graphTargetNodeId}-${quizMode}`}
          algorithmDefinition={primaryAlgorithm}
          panelLabel={isCompareMode ? "primary" : undefined}
          sharedValues={appliedArrayValues}
          sharedTargetValue={appliedTargetValue}
          graphTargetNodeId={graphTargetNodeId}
          quizMode={quizMode}
        />

        {isCompareMode && secondaryAlgorithm ? (
          <AlgorithmRunPanel
            key={`secondary-${secondaryAlgorithm.id}-${appliedArrayValues.join(",")}-${appliedTargetValue}-${graphTargetNodeId}-${quizMode}`}
            algorithmDefinition={secondaryAlgorithm}
            panelLabel="compare"
            sharedValues={appliedArrayValues}
            sharedTargetValue={appliedTargetValue}
            graphTargetNodeId={graphTargetNodeId}
            quizMode={quizMode}
          />
        ) : null}
      </div>

      <section className="swift-surface rounded-lg p-4 sm:p-5 space-y-2">
        <p className="max-w-full truncate text-[0.55rem] uppercase tracking-[0.12em] text-[#8f8475] sm:text-[0.66rem] sm:tracking-[0.14em]">visual modes</p>
        <p className="text-sm leading-relaxed text-[#4f4538]">
          Sorting algorithms use bar charts. Search algorithms use index cards. Graph algorithms switch to a node-link canvas.
        </p>
      </section>
    </div>
  )
}
