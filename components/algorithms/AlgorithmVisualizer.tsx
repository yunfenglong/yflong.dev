"use client"

import Link from "next/link"
import { useMemo } from "react"
import {
  algorithmCatalog,
  algorithmCatalogById,
  graphTargetOptions,
} from "@/config/algorithms"
import { AlgorithmRunPanel } from "./AlgorithmRunPanel"
import { ToggleControl } from "./AlgorithmVisualizerControls"
import { controlClassName } from "./AlgorithmVisualizer.constants"
import type {
  AlgorithmDefinition,
  AlgorithmMetrics,
  AlgorithmStep,
} from "@/types/algorithm"
import {
  formatCategoryLabel,
  formatDifficultyLabel,
  formatMetricValue,
  normalizeValuesForAlgorithm,
} from "@/utils/algorithm-visualizer"
import { useAlgorithmVisualizerState } from "@/hooks/algorithm/use-algorithm-visualizer-state"

type AlgorithmVisualizerProps = {
  initialAlgorithmId: string
}

type ScenarioPreset = {
  id: string
  label: string
  description: string
  arrayValues?: number[]
  targetValue?: number
  graphTargetNodeId?: string
}

type ComparisonMetric = {
  key: keyof AlgorithmMetrics
  label: string
}

const comparisonMetricPriority: Record<AlgorithmDefinition["category"], ComparisonMetric[]> = {
  sorting: [
    { key: "comparisons", label: "comparisons" },
    { key: "writes", label: "writes" },
    { key: "swaps", label: "swaps" },
  ],
  searching: [
    { key: "comparisons", label: "comparisons" },
    { key: "currentIndex", label: "index checks" },
  ],
  graphs: [
    { key: "pathCost", label: "path cost" },
    { key: "visited", label: "visited nodes" },
    { key: "relaxations", label: "relaxations" },
  ],
}

function getScenarioPresets(algorithmDefinition: AlgorithmDefinition): ScenarioPreset[] {
  if (algorithmDefinition.datasetKind === "graph") {
    return [
      {
        id: "near-target",
        label: "near target",
        description: "Stops earlier so you can inspect the first few frontier updates.",
        graphTargetNodeId: "D",
      },
      {
        id: "branch-trace",
        label: "branch trace",
        description: "Favors the lower-right branch to show a different route through the graph.",
        graphTargetNodeId: "F",
      },
      {
        id: "full-route",
        label: "full route",
        description: "Runs all the way to the default target so the final highlighted path is easy to compare.",
        graphTargetNodeId: algorithmDefinition.graph?.defaultTargetNodeId ?? "G",
      },
    ]
  }

  if (algorithmDefinition.category === "searching") {
    const usesSortedInput = Boolean(algorithmDefinition.requiresSortedInput)
    const scenarioValues = usesSortedInput
      ? [3, 7, 12, 18, 25, 31, 42, 56, 68]
      : [42, 7, 31, 18, 56, 3, 68, 12, 25]

    return [
      {
        id: "quick-hit",
        label: "quick hit",
        description: "Target appears early in the trace, so the walkthrough resolves quickly.",
        arrayValues: scenarioValues,
        targetValue: usesSortedInput ? 25 : 42,
      },
      {
        id: "late-hit",
        label: "late hit",
        description: "Target pushes the algorithm deeper into the dataset before it can finish.",
        arrayValues: scenarioValues,
        targetValue: usesSortedInput ? 68 : 25,
      },
      {
        id: "missing-target",
        label: "missing target",
        description: "Useful for the full failure case when the target never appears.",
        arrayValues: scenarioValues,
        targetValue: 57,
      },
    ]
  }

  return [
    {
      id: "nearly-sorted",
      label: "nearly sorted",
      description: "Shows how adaptive sorts benefit when only a small inversion remains.",
      arrayValues: [5, 9, 12, 16, 20, 18, 24, 29],
    },
    {
      id: "reverse-order",
      label: "reverse order",
      description: "A heavy input for simple sorts and a good stress case for the counters.",
      arrayValues: [91, 76, 62, 49, 35, 24, 13, 5],
    },
    {
      id: "duplicates",
      label: "duplicates",
      description: "Repeated values make stability and tie-handling easier to talk about.",
      arrayValues: [14, 8, 14, 3, 8, 21, 3, 18],
    },
  ]
}

function getCommonComparisonMetric(
  category: AlgorithmDefinition["category"],
  primaryFinalStep: AlgorithmStep | undefined,
  secondaryFinalStep: AlgorithmStep | undefined,
) {
  for (const metric of comparisonMetricPriority[category]) {
    const primaryValue = primaryFinalStep?.metrics?.[metric.key]
    const secondaryValue = secondaryFinalStep?.metrics?.[metric.key]

    if (typeof primaryValue === "number" && typeof secondaryValue === "number") {
      return {
        ...metric,
        primaryValue,
        secondaryValue,
      }
    }
  }

  return null
}

function buildCompareVerdict(
  primaryAlgorithm: AlgorithmDefinition,
  secondaryAlgorithm: AlgorithmDefinition,
  primarySteps: AlgorithmStep[],
  secondarySteps: AlgorithmStep[],
) {
  const primaryFinalStep = primarySteps[primarySteps.length - 1]
  const secondaryFinalStep = secondarySteps[secondarySteps.length - 1]
  const sharedMetric = getCommonComparisonMetric(
    primaryAlgorithm.category,
    primaryFinalStep,
    secondaryFinalStep,
  )

  if (sharedMetric && sharedMetric.primaryValue !== sharedMetric.secondaryValue) {
    const winner =
      sharedMetric.primaryValue < sharedMetric.secondaryValue ? primaryAlgorithm : secondaryAlgorithm
    const loser = winner.id === primaryAlgorithm.id ? secondaryAlgorithm : primaryAlgorithm
    const winnerMetric =
      winner.id === primaryAlgorithm.id ? sharedMetric.primaryValue : sharedMetric.secondaryValue
    const loserMetric =
      loser.id === primaryAlgorithm.id ? sharedMetric.primaryValue : sharedMetric.secondaryValue
    const winnerSteps = winner.id === primaryAlgorithm.id ? primarySteps.length : secondarySteps.length
    const loserSteps = loser.id === primaryAlgorithm.id ? primarySteps.length : secondarySteps.length

    return {
      headline: `${winner.name} wins this trace`,
      detail: `${winner.name} finishes with ${formatMetricValue(winnerMetric)} ${sharedMetric.label} and ${winnerSteps} steps, versus ${loser.name}'s ${formatMetricValue(loserMetric)} ${sharedMetric.label} and ${loserSteps} steps.`,
      chips: [
        { label: sharedMetric.label, value: `${formatMetricValue(sharedMetric.primaryValue)} vs ${formatMetricValue(sharedMetric.secondaryValue)}` },
        { label: "steps", value: `${primarySteps.length} vs ${secondarySteps.length}` },
      ],
    }
  }

  if (primarySteps.length !== secondarySteps.length) {
    const winner = primarySteps.length < secondarySteps.length ? primaryAlgorithm : secondaryAlgorithm
    const loser = winner.id === primaryAlgorithm.id ? secondaryAlgorithm : primaryAlgorithm
    const winnerSteps = winner.id === primaryAlgorithm.id ? primarySteps.length : secondarySteps.length
    const loserSteps = loser.id === primaryAlgorithm.id ? primarySteps.length : secondarySteps.length

    return {
      headline: `${winner.name} finishes sooner on this trace`,
      detail: `${winner.name} resolves the current walkthrough in ${winnerSteps} steps, while ${loser.name} takes ${loserSteps}.`,
      chips: [{ label: "steps", value: `${primarySteps.length} vs ${secondarySteps.length}` }],
    }
  }

  return {
    headline: "This comparison is effectively a tie",
    detail: `${primaryAlgorithm.name} and ${secondaryAlgorithm.name} end with the same step count on the current setup, so the differences here are more about how they get there than raw trace length.`,
    chips: [{ label: "steps", value: `${primarySteps.length} vs ${secondarySteps.length}` }],
  }
}

export default function AlgorithmVisualizer({ initialAlgorithmId }: AlgorithmVisualizerProps) {
  const primaryAlgorithm = algorithmCatalogById[initialAlgorithmId]

  const {
    isCompareMode,
    setIsCompareMode,
    quizMode,
    setQuizMode,
    arrayDraftText,
    setArrayDraftText,
    appliedArrayValues,
    targetDraftValue,
    setTargetDraftValue,
    appliedTargetValue,
    graphTargetNodeId,
    setGraphTargetNodeId,
    inputFeedback,
    shareableUrlFeedback,
    availableCompareAlgorithms,
    secondaryAlgorithm,
    secondaryAlgorithmId,
    setSecondaryAlgorithmId,
    currentShareableUrl,
    copyShareableUrl,
    applyArrayInput,
    resetArrayInput,
    randomizeDataset,
    applyTargetValue,
    resetGraphTarget,
    applyScenarioPreset,
  } = useAlgorithmVisualizerState({ initialAlgorithmId, primaryAlgorithm: primaryAlgorithm! })

  const showArrayControls = primaryAlgorithm?.datasetKind === "array"
  const showNumberTargetControl =
    primaryAlgorithm?.targetType === "number" || (isCompareMode && secondaryAlgorithm?.targetType === "number")
  const showNodeTargetControl =
    primaryAlgorithm?.targetType === "node" || (isCompareMode && secondaryAlgorithm?.targetType === "node")
  const scenarioPresets = useMemo(() => getScenarioPresets(primaryAlgorithm), [primaryAlgorithm])
  const relatedAlgorithms = useMemo(
    () =>
      algorithmCatalog
        .filter(
          (algorithmDefinition) =>
            algorithmDefinition.category === primaryAlgorithm.category &&
            algorithmDefinition.id !== primaryAlgorithm.id,
        )
        .slice(0, 3),
    [primaryAlgorithm],
  )

  const compareVerdict = useMemo(() => {
    if (!isCompareMode || !secondaryAlgorithm) {
      return null
    }

    const primarySteps = primaryAlgorithm.createSteps({
      values: normalizeValuesForAlgorithm(primaryAlgorithm, appliedArrayValues),
      targetValue: appliedTargetValue,
      graph: primaryAlgorithm.graph,
      targetNodeId: graphTargetNodeId,
    })
    const secondarySteps = secondaryAlgorithm.createSteps({
      values: normalizeValuesForAlgorithm(secondaryAlgorithm, appliedArrayValues),
      targetValue: appliedTargetValue,
      graph: secondaryAlgorithm.graph,
      targetNodeId: graphTargetNodeId,
    })

    return buildCompareVerdict(primaryAlgorithm, secondaryAlgorithm, primarySteps, secondarySteps)
  }, [
    appliedArrayValues,
    appliedTargetValue,
    graphTargetNodeId,
    isCompareMode,
    primaryAlgorithm,
    secondaryAlgorithm,
  ])

  if (!primaryAlgorithm) {
    return null
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <header className="space-y-3">
        <Link
          href="/alg"
          className="inline-flex aman-eyebrow hover:text-text-muted-dark transition-colors"
        >
          ← back to algorithms
        </Link>

        <div className="space-y-2 pt-1">
          <p className="aman-eyebrow">dedicated visualizer</p>
          <h1 className="aman-display text-3xl sm:text-4xl text-text-primary">
            {primaryAlgorithm.name}
          </h1>
          <p className="max-w-[48ch] text-sm text-text-body leading-relaxed">
            {primaryAlgorithm.description} This page keeps the runner, chart, and controls focused on a
            single algorithm so the walkthrough feels calmer than the overview page.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="aman-eyebrow normal-case tracking-normal font-medium">
            {formatCategoryLabel(primaryAlgorithm.category)}
          </span>
          <span className="swift-chip">{formatDifficultyLabel(primaryAlgorithm.difficulty)}</span>
          <span className="swift-chip">best {primaryAlgorithm.complexity.best}</span>
          <span className="swift-chip">worst {primaryAlgorithm.complexity.worst}</span>
          <span className="swift-chip">space {primaryAlgorithm.complexity.space}</span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {primaryAlgorithm.concepts.map((concept) => (
            <span key={concept} className="swift-chip normal-case tracking-normal font-medium">
              {concept}
            </span>
          ))}
        </div>
      </header>

      <section className="swift-surface rounded-lg p-5 space-y-4">
        <div className="grid gap-4 xl:grid-cols-[1.15fr_0.95fr]">
          <div className="space-y-3 rounded-md border border-border-inner bg-surface-inner p-4">
            <div className="space-y-1">
              <p className="text-[0.68rem] uppercase tracking-[0.14em] text-muted">session controls</p>
              <p className="text-sm leading-relaxed text-text-body">
                Compare this algorithm against a related one, turn on quiz mode, or keep the current
                state in a shareable URL.
              </p>
            </div>

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

            {isCompareMode && secondaryAlgorithm ? (
              <div className="space-y-2">
                <p className="max-w-full truncate text-[0.55rem] uppercase tracking-[0.12em] text-muted sm:text-[0.66rem] sm:tracking-[0.14em]">
                  compare against
                </p>
                <select
                  value={secondaryAlgorithm.id}
                  onChange={(event) => setSecondaryAlgorithmId(event.target.value)}
                  className="w-full rounded-md border border-border bg-surface-strong px-3 py-2 text-sm text-text-secondary outline-none transition-colors hover:bg-surface-hover-alt focus:border-[#b99e78]"
                >
                  {availableCompareAlgorithms.map((algorithmDefinition) => (
                    <option key={algorithmDefinition.id} value={algorithmDefinition.id}>
                      {algorithmDefinition.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-md border border-border-inner bg-surface-inner p-4 space-y-2">
              <p className="max-w-full truncate text-[0.55rem] uppercase tracking-[0.12em] text-muted sm:text-[0.66rem] sm:tracking-[0.14em]">
                current shareable URL
              </p>
              <button
                type="button"
                onClick={() => void copyShareableUrl()}
                className="w-full rounded-md border border-border bg-surface-strong px-3 py-2 text-left text-sm leading-relaxed text-text-secondary transition-colors hover:bg-surface-hover-alt focus:border-[#b99e78] focus:outline-none"
              >
                <span className="break-all">{currentShareableUrl}</span>
              </button>
              <p className="text-xs leading-relaxed text-[#7b6f61]">
                {shareableUrlFeedback ?? "Copy the URL to preserve this exact dataset, target, compare mode, and quiz state."}
              </p>
            </div>

            <div className="rounded-md border border-border-inner bg-surface-inner p-4 space-y-3">
              <p className="max-w-full truncate text-[0.55rem] uppercase tracking-[0.12em] text-muted sm:text-[0.66rem] sm:tracking-[0.14em]">
                browse more
              </p>
              <p className="text-sm leading-relaxed text-text-secondary">
                Want a different problem or visual mode? Jump back to the catalog and open another dedicated page.
              </p>
              <Link href="/alg" className={controlClassName}>
                open catalog
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="swift-surface rounded-lg p-5 space-y-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-1">
            <p className="text-[0.68rem] uppercase tracking-[0.14em] text-muted">scenario presets</p>
            <p className="max-w-2xl text-sm leading-relaxed text-text-body">
              Load a focused input that reveals a specific behavior quickly instead of hand-editing every value first.
            </p>
          </div>
          {inputFeedback ? <p className="text-sm leading-relaxed text-text-muted-dark">{inputFeedback}</p> : null}
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {scenarioPresets.map((scenarioPreset) => (
            <button
              key={scenarioPreset.id}
              type="button"
              onClick={() => applyScenarioPreset(scenarioPreset)}
              className="rounded-lg border border-[#d8cebf] bg-[#fbf7f0] p-4 text-left transition-all hover:border-[#c7b69b] hover:bg-[#f7f1e6]"
            >
              <div className="space-y-2">
                <p className="text-[0.62rem] uppercase tracking-[0.14em] text-muted">scenario</p>
                <h2 className="aman-display text-[1.08rem] leading-tight text-text-primary">{scenarioPreset.label}</h2>
                <p className="text-sm leading-relaxed text-text-muted-dark">{scenarioPreset.description}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {showArrayControls ? (
        <section className="swift-surface rounded-lg p-5 space-y-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-1">
              <p className="text-[0.68rem] uppercase tracking-[0.14em] text-muted">dataset controls</p>
              <p className="max-w-2xl text-sm leading-relaxed text-text-body">
                Use your own array, randomize a fresh one, or restore defaults. The same dataset is shared by both panels in compare mode.
              </p>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
            <div className="space-y-3">
              <label className="flex flex-col gap-1.5 text-[0.68rem] uppercase tracking-[0.14em] text-muted">
                <span>array input</span>
                <textarea
                  rows={3}
                  value={arrayDraftText}
                  onChange={(event) => setArrayDraftText(event.target.value)}
                  className="rounded-md border border-border bg-surface-strong px-3 py-2 text-sm leading-relaxed text-text-secondary outline-none transition-colors focus:border-[#b99e78]"
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
              <p className="text-sm leading-relaxed text-text-muted-dark">
                Enter up to 12 integers. Values are normalized to the range 1–99 for clean visualization.
              </p>
            </div>

            <div className="space-y-3">
              {showNumberTargetControl ? (
                <div className="rounded-md border border-border-inner bg-surface-inner p-4 space-y-3">
                  <label className="flex flex-col gap-1.5 text-[0.68rem] uppercase tracking-[0.14em] text-muted">
                    <span>target value</span>
                    <input
                      value={targetDraftValue}
                      onChange={(event) => setTargetDraftValue(event.target.value)}
                      className="rounded-md border border-border bg-surface-strong px-3 py-2 text-sm text-text-secondary outline-none transition-colors focus:border-[#b99e78]"
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
              <p className="text-[0.68rem] uppercase tracking-[0.14em] text-muted">graph controls</p>
              <p className="max-w-2xl text-sm leading-relaxed text-text-body">
                Graph algorithms reuse the same learning graph so you can compare traversal and shortest-path behavior side by side.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {showNodeTargetControl ? (
              <div className="rounded-md border border-border-inner bg-surface-inner p-4 space-y-3">
                <label className="flex flex-col gap-1.5 text-[0.68rem] uppercase tracking-[0.14em] text-muted">
                  <span>target node</span>
                  <select
                    value={graphTargetNodeId}
                    onChange={(event) => setGraphTargetNodeId(event.target.value)}
                    className="rounded-md border border-border bg-surface-strong px-3 py-2 text-sm text-text-secondary outline-none transition-colors focus:border-[#b99e78]"
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

            <div className="rounded-md border border-border-inner bg-surface-inner p-4 space-y-2">
              <p className="max-w-full truncate text-[0.55rem] uppercase tracking-[0.12em] text-muted sm:text-[0.66rem] sm:tracking-[0.14em]">graph note</p>
              <p className="text-sm leading-relaxed text-text-secondary">
                BFS and DFS emphasize traversal order. Dijkstra adds weighted relaxations and a cost-aware final route.
              </p>
            </div>
          </div>
        </section>
      )}

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

      {compareVerdict ? (
        <section className="swift-surface rounded-lg p-5 space-y-4">
          <div className="space-y-1.5">
            <p className="text-[0.68rem] uppercase tracking-[0.14em] text-muted">compare verdict</p>
            <h2 className="aman-display text-[1.35rem] leading-tight text-text-primary">
              {compareVerdict.headline}
            </h2>
            <p className="max-w-3xl text-sm leading-relaxed text-text-body">{compareVerdict.detail}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {compareVerdict.chips.map((chip) => (
              <span key={chip.label} className="swift-chip normal-case tracking-normal font-medium">
                {chip.label} · {chip.value}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {relatedAlgorithms.length > 0 ? (
        <section className="swift-surface rounded-lg p-5 space-y-4">
          <div className="space-y-1">
            <p className="text-[0.68rem] uppercase tracking-[0.14em] text-muted">more in this lane</p>
            <p className="text-sm leading-relaxed text-text-body">
              Want a different take on the same problem family? These stay in the same category but change the strategy.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {relatedAlgorithms.map((algorithmDefinition) => (
              <Link
                key={algorithmDefinition.id}
                href={`/alg/${algorithmDefinition.id}`}
                className="rounded-lg border border-[#d8cebf] bg-[#fbf7f0] p-4 text-left transition-all hover:border-[#c7b69b] hover:bg-[#f7f1e6]"
              >
                <div className="space-y-2">
                  <p className="text-[0.62rem] uppercase tracking-[0.14em] text-muted">
                    {formatDifficultyLabel(algorithmDefinition.difficulty)}
                  </p>
                  <h2 className="aman-display text-[1.15rem] leading-tight text-text-primary">{algorithmDefinition.name}</h2>
                  <p className="text-sm leading-relaxed text-text-muted-dark">{algorithmDefinition.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
