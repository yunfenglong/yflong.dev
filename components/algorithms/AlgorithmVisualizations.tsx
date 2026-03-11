import AlgorithmGraphFlow from "./AlgorithmGraphFlow"
import type { AlgorithmStep, GraphDefinition } from "@/types/algorithm"

export function ArrayBarVisualization({
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

          let barClassName = "border-border bg-[#e9decd] text-text-secondary"

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
              <span className="max-w-full truncate text-[0.55rem] uppercase tracking-[0.12em] text-muted sm:text-[0.66rem] sm:tracking-[0.14em]">
                idx {valueIndex}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function ArrayCardVisualization({
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
      <div className="flex flex-wrap items-center gap-2 text-[0.66rem] uppercase tracking-[0.14em] text-muted">
        {typeof targetValue === "number" ? <span className="swift-chip">target {targetValue}</span> : null}
        <span className="swift-chip">range {rangeStart}–{rangeEnd}</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {values.map((value, valueIndex) => {
          const isInRange = valueIndex >= rangeStart && valueIndex <= rangeEnd
          const isCompared = comparedSet.has(valueIndex)
          const isActive = activeSet.has(valueIndex)
          const isFound = foundSet.has(valueIndex)

          let cardClassName = "border-border bg-[#f7f1e8] text-text-secondary"

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

export function GraphVisualization({
  graph,
  step,
}: {
  graph: GraphDefinition
  step: AlgorithmStep
}) {
  const graphState = step.graphState

  return (
    <div className="space-y-4">
      <div className="relative h-[18.5rem] overflow-hidden rounded-lg border border-border-inner bg-[radial-gradient(circle_at_top,#fbf8f2_0%,#f4ede3_60%,#f1e9dd_100%)] sm:h-[22rem] lg:h-[24rem]">
        <AlgorithmGraphFlow graph={graph} step={step} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {graphState?.queue ? (
          <div className="rounded-md border border-border-inner bg-surface-inner p-3">
            <p className="max-w-full truncate text-[0.55rem] uppercase tracking-[0.12em] text-muted sm:text-[0.66rem] sm:tracking-[0.14em]">queue</p>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              {graphState.queue.length > 0 ? graphState.queue.join(" → ") : "empty"}
            </p>
          </div>
        ) : null}
        {graphState?.stack ? (
          <div className="rounded-md border border-border-inner bg-surface-inner p-3">
            <p className="max-w-full truncate text-[0.55rem] uppercase tracking-[0.12em] text-muted sm:text-[0.66rem] sm:tracking-[0.14em]">stack</p>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              {graphState.stack.length > 0 ? graphState.stack.join(" → ") : "empty"}
            </p>
          </div>
        ) : null}
        <div className="rounded-md border border-border-inner bg-surface-inner p-3">
          <p className="max-w-full truncate text-[0.55rem] uppercase tracking-[0.12em] text-muted sm:text-[0.66rem] sm:tracking-[0.14em]">current node</p>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            {graphState?.currentNodeId ?? "none"}
          </p>
        </div>
        {graphState?.pathNodeIds?.length ? (
          <div className="rounded-md border border-border-inner bg-surface-inner p-3 sm:col-span-2 lg:col-span-1">
            <p className="max-w-full truncate text-[0.55rem] uppercase tracking-[0.12em] text-muted sm:text-[0.66rem] sm:tracking-[0.14em]">final route</p>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              {graphState.pathNodeIds.join(" → ")}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
