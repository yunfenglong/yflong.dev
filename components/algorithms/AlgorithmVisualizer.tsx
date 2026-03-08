"use client"

import { useEffect, useMemo, useState } from "react"
import { algorithmCatalog } from "@/config/algorithms"
import type { AlgorithmCategory } from "@/types/algorithm"

const controlClassName =
  "inline-flex items-center justify-center rounded-md border border-[#d7ccbc] bg-[#f6f1e8] px-3 py-2 text-[0.68rem] uppercase tracking-[0.12em] text-[#4f4538] transition-colors hover:bg-[#eee5d7] disabled:cursor-not-allowed disabled:opacity-45"

const speedOptions = [
  { label: "0.75x", intervalMs: 1200 },
  { label: "1x", intervalMs: 750 },
  { label: "1.5x", intervalMs: 450 },
] as const

const filterOptions: Array<{ label: string; value: "all" | AlgorithmCategory }> = [
  { label: "all algorithms", value: "all" },
  { label: "sorting only", value: "sorting" },
  { label: "searching only", value: "searching" },
]

function formatCategoryLabel(category: string) {
  return category === "sorting" ? "sorting" : "searching"
}

export default function AlgorithmVisualizer() {
  const [selectedAlgorithmId, setSelectedAlgorithmId] = useState(algorithmCatalog[0]?.id ?? "")
  const [activeFilter, setActiveFilter] = useState<"all" | AlgorithmCategory>("all")
  const [stepIndex, setStepIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [intervalMs, setIntervalMs] = useState<number>(speedOptions[1].intervalMs)

  const filteredAlgorithms = useMemo(
    () =>
      activeFilter === "all"
        ? algorithmCatalog
        : algorithmCatalog.filter(
            (algorithmDefinition) => algorithmDefinition.category === activeFilter,
          ),
    [activeFilter],
  )

  const selectedAlgorithm = useMemo(
    () =>
      filteredAlgorithms.find((algorithmDefinition) => algorithmDefinition.id === selectedAlgorithmId) ??
      filteredAlgorithms[0] ??
      algorithmCatalog[0],
    [filteredAlgorithms, selectedAlgorithmId],
  )

  const steps = useMemo(() => {
    if (!selectedAlgorithm) {
      return []
    }

    return selectedAlgorithm.createSteps(
      [...selectedAlgorithm.initialValues],
      selectedAlgorithm.targetValue,
    )
  }, [selectedAlgorithm])

  const currentStep = steps[stepIndex]
  const maxValue = Math.max(...(currentStep?.values ?? [1]))

  useEffect(() => {
    setStepIndex(0)
    setIsPlaying(false)
  }, [selectedAlgorithmId])

  useEffect(() => {
    if (
      filteredAlgorithms.length > 0 &&
      !filteredAlgorithms.some(
        (algorithmDefinition) => algorithmDefinition.id === selectedAlgorithmId,
      )
    ) {
      setSelectedAlgorithmId(filteredAlgorithms[0].id)
    }
  }, [filteredAlgorithms, selectedAlgorithmId])

  useEffect(() => {
    if (!isPlaying || steps.length === 0) {
      return
    }

    if (stepIndex >= steps.length - 1) {
      setIsPlaying(false)
      return
    }

    const timer = window.setTimeout(() => {
      setStepIndex((currentIndex) => Math.min(currentIndex + 1, steps.length - 1))
    }, intervalMs)

    return () => window.clearTimeout(timer)
  }, [intervalMs, isPlaying, stepIndex, steps.length])

  if (!selectedAlgorithm || !currentStep) {
    return null
  }

  const comparedSet = new Set(currentStep.comparedIndices ?? [])
  const activeSet = new Set(currentStep.activeIndices ?? [])
  const sortedSet = new Set(currentStep.sortedIndices ?? [])
  const foundSet = new Set(currentStep.foundIndices ?? [])

  const [rangeStart, rangeEnd] = currentStep.range ?? [0, currentStep.values.length - 1]

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="swift-surface rounded-lg p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-[0.68rem] uppercase tracking-[0.14em] text-[#8f8475]">
              algorithm catalog
            </p>
            <p className="text-sm leading-relaxed text-[#554b3e]">
              Filter the list first, then choose the algorithm you want to replay.
            </p>
          </div>

          <label className="flex flex-col gap-1.5 text-[0.68rem] uppercase tracking-[0.14em] text-[#8f8475] sm:items-end">
            <span>filter</span>
            <div className="relative">
              <select
                value={activeFilter}
                onChange={(event) => setActiveFilter(event.target.value as "all" | AlgorithmCategory)}
                className="appearance-none rounded-md border border-[#d7ccbc] bg-[#f8f3eb] px-3 py-2 pr-9 text-[0.72rem] uppercase tracking-[0.12em] text-[#4f4538] outline-none transition-colors hover:bg-[#f2eadf] focus:border-[#b99e78]"
              >
                {filterOptions.map((filterOption) => (
                  <option key={filterOption.value} value={filterOption.value}>
                    {filterOption.label}
                  </option>
                ))}
              </select>
              <svg
                aria-hidden="true"
                viewBox="0 0 10 10"
                className="pointer-events-none absolute right-3 top-1/2 h-2.5 w-2.5 -translate-y-1/2 text-[#7c6f60]"
                fill="none"
              >
                <path d="M1.5 3.5 5 7l3.5-3.5" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </div>
          </label>
        </div>

        <p className="mt-3 text-[0.68rem] uppercase tracking-[0.14em] text-[#8f8475]">
          showing {filteredAlgorithms.length} algorithm{filteredAlgorithms.length === 1 ? "" : "s"}
        </p>
      </section>

      {filteredAlgorithms.length > 0 ? (
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {filteredAlgorithms.map((algorithmDefinition) => {
            const isSelected = algorithmDefinition.id === selectedAlgorithm.id

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
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[0.62rem] uppercase tracking-[0.14em] text-[#8f8475]">
                      {formatCategoryLabel(algorithmDefinition.category)}
                    </span>
                    <span className="swift-chip">{algorithmDefinition.timeComplexity}</span>
                  </div>
                  <h2 className="aman-display text-[1.25rem] leading-tight text-[#3b342c]">
                    {algorithmDefinition.name}
                  </h2>
                  <p className="text-sm leading-relaxed text-[#5f5446]">
                    {algorithmDefinition.description}
                  </p>
                </div>
              </button>
            )
          })}
        </section>
      ) : (
        <section className="swift-surface rounded-lg p-5">
          <p className="text-sm leading-relaxed text-[#554b3e]">
            No algorithms match this filter yet.
          </p>
        </section>
      )}

      <section className="swift-surface-strong rounded-lg p-6 sm:p-8 space-y-5">
        <header className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[0.68rem] uppercase tracking-[0.14em] text-[#8f8475]">
              {formatCategoryLabel(selectedAlgorithm.category)} lab
            </span>
            <span className="swift-chip">time {selectedAlgorithm.timeComplexity}</span>
            <span className="swift-chip">space {selectedAlgorithm.spaceComplexity}</span>
            {selectedAlgorithm.targetValue ? (
              <span className="swift-chip">target {selectedAlgorithm.targetValue}</span>
            ) : null}
          </div>
          <div className="space-y-2">
            <h2 className="aman-display text-[1.8rem] sm:text-[2.05rem] leading-none text-[#3b342c]">
              {selectedAlgorithm.name}
            </h2>
            <p className="max-w-3xl text-sm sm:text-[0.95rem] leading-relaxed text-[#554b3e]">
              {selectedAlgorithm.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedAlgorithm.concepts.map((concept) => (
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
            className={controlClassName}
          >
            {isPlaying ? "pause" : "play"}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsPlaying(false)
              setStepIndex((currentIndex) => Math.max(currentIndex - 1, 0))
            }}
            disabled={stepIndex === 0}
            className={controlClassName}
          >
            prev
          </button>
          <button
            type="button"
            onClick={() => {
              setIsPlaying(false)
              setStepIndex((currentIndex) => Math.min(currentIndex + 1, steps.length - 1))
            }}
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
          <div className="flex items-center gap-2 pl-1">
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

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3 text-[0.68rem] uppercase tracking-[0.14em] text-[#8f8475]">
            <span>
              step {stepIndex + 1} / {steps.length}
            </span>
            <span>{currentStep.message}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#e8dece]">
            <div
              className="h-full rounded-full bg-[#a88d6a] transition-all duration-300"
              style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="swift-surface rounded-lg p-4 sm:p-5">
          <div className="flex min-h-[20rem] items-end gap-3 overflow-x-auto px-2 pb-1 pt-8 scrollbar-hide sm:min-h-[24rem]">
            {currentStep.values.map((value, valueIndex) => {
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
                <div key={`${selectedAlgorithm.id}-${valueIndex}`} className="flex min-w-[3.5rem] flex-col items-center gap-2">
                  <span className="text-sm font-semibold text-[#5b5143]">{value}</span>
                  <div
                    className={`flex w-full items-end justify-center rounded-md border text-sm font-semibold transition-all duration-300 ${barClassName}`}
                    style={{ height: `${heightPercentage}%`, minHeight: "3.25rem" }}
                  >
                    <span className="pb-3">{value}</span>
                  </div>
                  <span className="text-[0.66rem] uppercase tracking-[0.14em] text-[#8f8475]">
                    idx {valueIndex}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="swift-surface rounded-lg p-5 space-y-4">
            <div className="space-y-1.5">
              <h3 className="text-[0.68rem] uppercase tracking-[0.14em] text-[#8f8475]">
                current explanation
              </h3>
              <p className="text-sm leading-relaxed text-[#4f4538]">{currentStep.message}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-[#ddd2c1] bg-[#f8f3eb] p-3">
                <p className="text-[0.66rem] uppercase tracking-[0.14em] text-[#8f8475]">dataset</p>
                <p className="mt-2 text-sm leading-relaxed text-[#4f4538]">
                  {selectedAlgorithm.initialValues.join(", ")}
                </p>
              </div>
              <div className="rounded-md border border-[#ddd2c1] bg-[#f8f3eb] p-3">
                <p className="text-[0.66rem] uppercase tracking-[0.14em] text-[#8f8475]">active range</p>
                <p className="mt-2 text-sm leading-relaxed text-[#4f4538]">
                  {currentStep.range ? `${rangeStart} to ${rangeEnd}` : "Full dataset"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-[0.66rem] uppercase tracking-[0.12em] text-[#5f5446]">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#d8cebf] bg-[#f8f3eb] px-3 py-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#efdfc6]" /> compare
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#d8cebf] bg-[#f8f3eb] px-3 py-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#e8d1b1]" /> active
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#d8cebf] bg-[#f8f3eb] px-3 py-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#dce7d7]" /> sorted
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#d8cebf] bg-[#f8f3eb] px-3 py-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#cfe1c9]" /> found
              </span>
            </div>
          </section>

          <section className="swift-surface rounded-lg p-5 space-y-4">
            <div className="space-y-1.5">
              <h3 className="text-[0.68rem] uppercase tracking-[0.14em] text-[#8f8475]">
                pseudocode
              </h3>
              <div className="rounded-md border border-[#ddd2c1] bg-[#f4ece0] p-4 font-mono text-[0.8rem] leading-7 text-[#4b4033]">
                {selectedAlgorithm.pseudocode.map((line, lineIndex) => (
                  <div key={line} className="flex gap-3">
                    <span className="select-none text-[#9a8873]">{lineIndex + 1}</span>
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-md border border-[#ddd2c1] bg-[#f8f3eb] p-4 space-y-2">
              <h3 className="text-[0.68rem] uppercase tracking-[0.14em] text-[#8f8475]">
                why it helps
              </h3>
              <p className="text-sm leading-relaxed text-[#4f4538]">
                Use this page like a study lab: move one step at a time, watch which values change, and
                match each visual state to the pseudocode on the right.
              </p>
            </div>
          </section>
        </div>
      </section>
    </div>
  )
}
