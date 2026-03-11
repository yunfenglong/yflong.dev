"use client"

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type TouchEvent,
} from "react"
import type { AlgorithmDefinition } from "@/types/algorithm"
import { controlClassName, metricDefinitions, speedOptions } from "./AlgorithmVisualizer.constants"
import {
  arraysEqual,
  formatCategoryLabel,
  formatDifficultyLabel,
  formatMetricValue,
  getNextQuiz,
  normalizeValuesForAlgorithm,
} from "@/utils/algorithm-visualizer"
import {
  ArrayBarVisualization,
  ArrayCardVisualization,
  GraphVisualization,
} from "./AlgorithmVisualizations"

export function AlgorithmRunPanel({
  algorithmDefinition,
  panelLabel,
  sharedValues,
  sharedTargetValue,
  graphTargetNodeId,
  quizMode,
  showBuilderNotes = false,
}: {
  algorithmDefinition: AlgorithmDefinition
  panelLabel?: string
  sharedValues: number[]
  sharedTargetValue: number
  graphTargetNodeId: string
  quizMode: boolean
  showBuilderNotes?: boolean
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

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = event.changedTouches[0]?.clientX ?? null
    touchStartYRef.current = event.changedTouches[0]?.clientY ?? null
  }

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
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
        <div className="hidden flex-wrap items-center justify-between gap-3 md:flex">
          <div className="space-y-1">
            <p className="text-[0.68rem] uppercase tracking-[0.14em] text-[#8f8475]">chart + counters</p>
            <p className="text-sm leading-relaxed text-[#554b3e]">The visualization and the live counters stay together so each step is easier to read.</p>
          </div>
          <p className="w-full break-words text-[0.64rem] uppercase tracking-[0.12em] text-[#8f8475] sm:w-auto sm:text-[0.68rem] sm:tracking-[0.14em] [overflow-wrap:anywhere]">current action · {currentStep.actionLabel}</p>
        </div>

        <div className="rounded-md border border-[#ddd2c1] bg-[#f8f3eb] px-3 py-2 md:hidden">
          <p className="text-[0.62rem] uppercase tracking-[0.12em] text-[#8f8475]">current action</p>
          <p className="mt-1 text-sm leading-relaxed text-[#4f4538]">{currentStep.actionLabel}</p>
        </div>

        <div className="hidden gap-2 overflow-hidden md:grid" style={counterGridStyle}>
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

      {showBuilderNotes ? (
        <section className="swift-surface rounded-lg p-5 space-y-4">
          <h3 className="text-[0.68rem] uppercase tracking-[0.14em] text-[#8f8475]">
            what I learned building this
          </h3>
          <div className="grid gap-3 xl:grid-cols-3">
            <div className="rounded-md border border-[#ddd2c1] bg-[#f8f3eb] p-4">
              <p className="max-w-full truncate text-[0.55rem] uppercase tracking-[0.12em] text-[#8f8475] sm:text-[0.66rem] sm:tracking-[0.14em]">
                typed definitions
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#4f4538]">
                One algorithm schema now drives the catalog, counters, pseudocode, notes, and visual modes,
                which keeps the UI consistent as the lab grows.
              </p>
            </div>
            <div className="rounded-md border border-[#ddd2c1] bg-[#f8f3eb] p-4">
              <p className="max-w-full truncate text-[0.55rem] uppercase tracking-[0.12em] text-[#8f8475] sm:text-[0.66rem] sm:tracking-[0.14em]">
                replay over mutation
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#4f4538]">
                Precomputed steps made it much easier to synchronize explanations, metrics, quiz prompts,
                and scrubber playback without hidden state drifting out of sync.
              </p>
            </div>
            <div className="rounded-md border border-[#ddd2c1] bg-[#f8f3eb] p-4">
              <p className="max-w-full truncate text-[0.55rem] uppercase tracking-[0.12em] text-[#8f8475] sm:text-[0.66rem] sm:tracking-[0.14em]">
                portfolio framing
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#4f4538]">
                Shareable URL state, compare mode, and responsive layouts mattered as much as the
                algorithm logic because this page needs to teach clearly and still feel polished as a product.
              </p>
            </div>
          </div>
        </section>
      ) : null}
    </section>
  )
}
