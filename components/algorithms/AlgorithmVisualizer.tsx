"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  algorithmCatalog,
  algorithmCatalogById,
  graphTargetOptions,
} from "@/config/algorithms"
import { AlgorithmRunPanel } from "./AlgorithmRunPanel"
import { SegmentedControl, ToggleControl } from "./AlgorithmVisualizerControls"
import {
  controlClassName,
  filterOptions,
  groupOptions,
  storageKey,
} from "./AlgorithmVisualizer.constants"
import type { AlgorithmDefinition } from "@/types/algorithm"
import type {
  FilterValue,
  GroupBy,
  PersistedState,
} from "@/types/algorithm-visualizer"
import {
  formatCategoryLabel,
  formatDifficultyLabel,
  getCompareCandidates,
  getDefaultArrayValues,
  getDefaultTargetValue,
  getPrimaryDefaultId,
  isValidAlgorithmId,
  isValidFilterValue,
  isValidGraphTarget,
  isValidGroupValue,
  parseArrayInput,
  randomArrayValues,
  readPersistedState,
} from "@/utils/algorithm-visualizer"

type CuratedPreset = {
  label: string
  title: string
  description: string
  algorithmId: string
  filter: FilterValue
  groupBy: GroupBy
  compareMode?: boolean
  secondaryAlgorithmId?: string
  quizMode?: boolean
}

const curatedPresets: CuratedPreset[] = [
  {
    label: "start here",
    title: "Bubble sort walkthrough",
    description: "Best first stop for seeing counters, pseudocode, and step-by-step state changes line up.",
    algorithmId: "bubble-sort",
    filter: "sorting",
    groupBy: "none",
  },
  {
    label: "side by side",
    title: "Linear vs binary",
    description: "Compare scanning against range-halving on the same target and dataset.",
    algorithmId: "linear-search",
    filter: "searching",
    groupBy: "none",
    compareMode: true,
    secondaryAlgorithmId: "binary-search",
  },
  {
    label: "graph demo",
    title: "Dijkstra pathfinding",
    description: "Jump into the weighted graph view to inspect relaxations, distances, and finalized nodes.",
    algorithmId: "dijkstra",
    filter: "graphs",
    groupBy: "none",
  },
]

function getTradeoffSummary(algorithmDefinition: AlgorithmDefinition) {
  const keywordPattern = /slow|requires|not |does not|worse|degrades|queue can|grows|extra memory|worst-case|not helpful/i

  return (
    algorithmDefinition.notes.tradeoffs.find((tradeoff) => keywordPattern.test(tradeoff)) ??
    algorithmDefinition.notes.tradeoffs[algorithmDefinition.notes.tradeoffs.length - 1] ??
    "Explore the full notes for caveats and constraints."
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

  const applyPreset = (preset: CuratedPreset) => {
    const nextAlgorithm = algorithmCatalogById[preset.algorithmId] ?? defaultPrimaryDefinition
    const compareCandidates = getCompareCandidates(nextAlgorithm)
    const nextSecondaryId =
      preset.compareMode && preset.secondaryAlgorithmId
        ? compareCandidates.find((algorithmDefinition) => algorithmDefinition.id === preset.secondaryAlgorithmId)?.id ??
          compareCandidates[0]?.id ??
          ""
        : ""
    const nextValues = getDefaultArrayValues(nextAlgorithm)
    const nextTargetValue = getDefaultTargetValue(nextAlgorithm)
    const nextGraphTarget =
      nextAlgorithm.graph?.defaultTargetNodeId ??
      graphTargetOptions[graphTargetOptions.length - 1]?.value ??
      "G"

    setSelectedAlgorithmId(nextAlgorithm.id)
    setSecondaryAlgorithmId(nextSecondaryId)
    setActiveFilter(preset.filter)
    setGroupBy(preset.groupBy)
    setIsCompareMode(Boolean(preset.compareMode && nextSecondaryId))
    setQuizMode(Boolean(preset.quizMode))
    setAppliedArrayValues(nextValues)
    setArrayDraftText(nextValues.join(", "))
    setAppliedTargetValue(nextTargetValue)
    setTargetDraftValue(String(nextTargetValue))
    setGraphTargetNodeId(nextGraphTarget)
    setInputFeedback(`${nextAlgorithm.name} preset loaded.`)
    setShareableUrlFeedback(null)
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
              Choose a lane, load a curated demo, then replay the algorithm you want to inspect.
            </p>
          </div>
          <p className="text-[0.68rem] uppercase tracking-[0.14em] text-[#8f8475]">
            showing {filteredAlgorithms.length} algorithm{filteredAlgorithms.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="hidden space-y-3 md:block">
          <div className="space-y-1">
            <p className="text-[0.68rem] uppercase tracking-[0.14em] text-[#8f8475]">start here</p>
            <p className="text-sm leading-relaxed text-[#554b3e]">
              These presets are the quickest way to see the strongest demos in this section.
            </p>
          </div>

          <div className="grid gap-3 xl:grid-cols-3">
            {curatedPresets.map((preset) => {
              const isActive =
                selectedAlgorithmId === preset.algorithmId &&
                activeFilter === preset.filter &&
                groupBy === preset.groupBy &&
                isCompareMode === Boolean(preset.compareMode)

              return (
                <button
                  key={preset.title}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={`rounded-lg border p-4 text-left transition-all ${
                    isActive
                      ? "border-[#baa487] bg-[#f7efe1] shadow-[0_1.1rem_1.9rem_-1.4rem_rgba(30,24,17,0.4)]"
                      : "border-[#d8cebf] bg-[#fbf7f0] hover:border-[#c7b69b] hover:bg-[#f7f1e6]"
                  }`}
                >
                  <div className="space-y-2">
                    <p className="text-[0.62rem] uppercase tracking-[0.14em] text-[#8f8475]">{preset.label}</p>
                    <h2 className="aman-display text-[1.15rem] leading-tight text-[#3b342c]">{preset.title}</h2>
                    <p className="text-sm leading-relaxed text-[#5f5446]">{preset.description}</p>
                    <p className="text-[0.66rem] uppercase tracking-[0.12em] text-[#8f8475]">
                      {preset.compareMode ? "loads compare mode" : "loads a focused walkthrough"}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
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

        <div className={`grid gap-3 ${isCompareMode && secondaryAlgorithm ? "sm:grid-cols-2" : ""}`}>
          {isCompareMode && secondaryAlgorithm ? (
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
          ) : null}

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
              {shareableUrlFeedback ?? "Copy the URL to save this exact state, including filters, inputs, and modes."}
            </p>
          </div>
        </div>

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

                      <div className="space-y-2 rounded-md border border-[#e3d8c8] bg-[#f8f3eb] p-3">
                        <p className="text-[0.66rem] uppercase tracking-[0.12em] text-[#8f8475]">
                          best for
                        </p>
                        <p className="text-sm leading-relaxed text-[#4f4538]">
                          {algorithmDefinition.notes.whenToUse}
                        </p>
                        <p className="text-[0.66rem] uppercase tracking-[0.12em] text-[#8f8475]">
                          tradeoff
                        </p>
                        <p className="text-sm leading-relaxed text-[#4f4538]">
                          {getTradeoffSummary(algorithmDefinition)}
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
          showBuilderNotes
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
