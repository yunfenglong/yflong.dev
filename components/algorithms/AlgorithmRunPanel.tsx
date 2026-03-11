"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type TouchEvent,
} from "react";
import type { AlgorithmDefinition, AlgorithmMetrics } from "@/types/algorithm";
import {
  controlClassName,
  metricDefinitions,
  speedOptions,
} from "./AlgorithmVisualizer.constants";
import {
  arraysEqual,
  formatMetricValue,
  getNextQuiz,
  normalizeValuesForAlgorithm,
} from "@/utils/algorithm-visualizer";
import {
  ArrayBarVisualization,
  ArrayCardVisualization,
  GraphVisualization,
} from "./AlgorithmVisualizations";

const summaryMetricPriority: Record<
  AlgorithmDefinition["category"],
  Array<keyof AlgorithmMetrics>
> = {
  sorting: ["comparisons", "swaps", "writes", "passes", "sortedCount"],
  searching: ["comparisons", "currentIndex", "low", "mid", "high"],
  graphs: [
    "visited",
    "relaxations",
    "pathCost",
    "queueSize",
    "stackSize",
    "frontierSize",
  ],
};

function getMetricLabel(metricKey: keyof AlgorithmMetrics) {
  return (
    metricDefinitions.find(
      (metricDefinition) => metricDefinition.key === metricKey,
    )?.label ?? metricKey
  );
}

function getSummaryMetricEntries(
  algorithmDefinition: AlgorithmDefinition,
  finalMetrics: AlgorithmMetrics | undefined,
) {
  return summaryMetricPriority[algorithmDefinition.category]
    .map((metricKey) => ({
      key: metricKey,
      label: getMetricLabel(metricKey),
      value: finalMetrics?.[metricKey],
    }))
    .filter((metricEntry) => typeof metricEntry.value === "number")
    .slice(0, 4);
}

function getSummaryMessage(
  algorithmDefinition: AlgorithmDefinition,
  stepCount: number,
  finalMessage: string,
  finalValues: number[] | undefined,
) {
  if (algorithmDefinition.category === "sorting" && finalValues?.length) {
    return `Finished in ${stepCount} steps. Final order: ${finalValues.join(", ")}.`;
  }

  return `Finished in ${stepCount} steps. ${finalMessage}`;
}

export function AlgorithmRunPanel({
  algorithmDefinition,
  panelLabel,
  sharedValues,
  sharedTargetValue,
  graphTargetNodeId,
  quizMode,
  showBuilderNotes = false,
}: {
  algorithmDefinition: AlgorithmDefinition;
  panelLabel?: string;
  sharedValues: number[];
  sharedTargetValue: number;
  graphTargetNodeId: string;
  quizMode: boolean;
  showBuilderNotes?: boolean;
}) {
  const normalizedValues = useMemo(
    () => normalizeValuesForAlgorithm(algorithmDefinition, sharedValues),
    [algorithmDefinition, sharedValues],
  );

  const steps = useMemo(
    () =>
      algorithmDefinition.createSteps({
        values: normalizedValues,
        targetValue: sharedTargetValue,
        graph: algorithmDefinition.graph,
        targetNodeId: graphTargetNodeId,
      }),
    [
      algorithmDefinition,
      graphTargetNodeId,
      normalizedValues,
      sharedTargetValue,
    ],
  );

  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [intervalMs, setIntervalMs] = useState<number>(
    speedOptions[1].intervalMs,
  );
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<string | null>(
    null,
  );
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const currentStep = steps[Math.min(stepIndex, Math.max(steps.length - 1, 0))];
  const finalStep = steps[steps.length - 1];
  const progressPercentage =
    steps.length > 1 ? Math.round((stepIndex / (steps.length - 1)) * 100) : 100;
  const quiz = useMemo(
    () => getNextQuiz(algorithmDefinition, steps, stepIndex),
    [algorithmDefinition, stepIndex, steps],
  );

  useEffect(() => {
    setStepIndex(0);
    setIsPlaying(false);
    setSelectedQuizAnswer(null);
  }, [
    algorithmDefinition,
    graphTargetNodeId,
    normalizedValues,
    sharedTargetValue,
  ]);

  useEffect(() => {
    setSelectedQuizAnswer(null);
  }, [quizMode, stepIndex]);

  useEffect(() => {
    if (quizMode && isPlaying) {
      setIsPlaying(false);
    }
  }, [isPlaying, quizMode]);

  useEffect(() => {
    if (!isPlaying || quizMode || steps.length === 0) {
      return;
    }

    if (stepIndex >= steps.length - 1) {
      setIsPlaying(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setStepIndex((currentValue) =>
        Math.min(currentValue + 1, steps.length - 1),
      );
    }, intervalMs);

    return () => window.clearTimeout(timer);
  }, [intervalMs, isPlaying, quizMode, stepIndex, steps.length]);

  if (!currentStep || !finalStep) {
    return null;
  }

  const metricEntries = metricDefinitions.filter(
    (metricDefinition) =>
      typeof currentStep.metrics?.[metricDefinition.key] === "number" ||
      typeof finalStep.metrics?.[metricDefinition.key] === "number",
  );
  const summaryMetricEntries = getSummaryMetricEntries(
    algorithmDefinition,
    finalStep.metrics,
  );
  const summaryMessage = getSummaryMessage(
    algorithmDefinition,
    steps.length,
    finalStep.message,
    finalStep.values,
  );
  const finalPathLabel = finalStep.graphState?.pathNodeIds?.length
    ? finalStep.graphState.pathNodeIds.join(" → ")
    : null;
  const scrubberStyle = {
    "--alg-progress": `${progressPercentage}%`,
  } as CSSProperties;
  const counterGridStyle = {
    gridTemplateColumns: "repeat(auto-fit, minmax(7rem, 1fr))",
  } as CSSProperties;

  const normalizedInputChanged =
    algorithmDefinition.datasetKind === "array" &&
    algorithmDefinition.requiresSortedInput &&
    !arraysEqual(normalizedValues, sharedValues);

  const handlePrevious = () => {
    setIsPlaying(false);
    setStepIndex((currentValue) => Math.max(currentValue - 1, 0));
  };

  const handleNext = () => {
    setIsPlaying(false);
    setStepIndex((currentValue) =>
      Math.min(currentValue + 1, steps.length - 1),
    );
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = event.changedTouches[0]?.clientX ?? null;
    touchStartYRef.current = event.changedTouches[0]?.clientY ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const startX = touchStartXRef.current;
    const startY = touchStartYRef.current;
    const endX = event.changedTouches[0]?.clientX ?? null;
    const endY = event.changedTouches[0]?.clientY ?? null;

    if (startX === null || startY === null || endX === null || endY === null) {
      return;
    }

    const deltaX = endX - startX;
    const deltaY = endY - startY;

    if (Math.abs(deltaX) < 42 || Math.abs(deltaX) <= Math.abs(deltaY)) {
      return;
    }

    if (deltaX < 0) {
      handleNext();
      return;
    }

    handlePrevious();
  };

  return (
    <section className="min-w-0 swift-surface-strong rounded-lg p-5 sm:p-6 space-y-5">
      {panelLabel ? (
        <header className="flex flex-wrap items-center gap-2">
          <span className="swift-chip">{panelLabel}</span>
          <span className="text-sm font-medium text-text-secondary">
            {algorithmDefinition.name}
          </span>
        </header>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setIsPlaying((currentlyPlaying) => !currentlyPlaying)}
          disabled={quizMode}
          className={controlClassName}
        >
          {isPlaying ? "pause" : "play"}
        </button>
        <button
          type="button"
          onClick={handlePrevious}
          disabled={stepIndex === 0}
          className={controlClassName}
        >
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
            setIsPlaying(false);
            setStepIndex(0);
          }}
          className={controlClassName}
        >
          reset
        </button>
        <div className="flex flex-wrap items-center gap-2 pl-1">
          {speedOptions.map((speedOption) => {
            const isActive = speedOption.intervalMs === intervalMs;

            return (
              <button
                key={speedOption.label}
                type="button"
                onClick={() => setIntervalMs(speedOption.intervalMs)}
                className={`rounded-md border px-3 py-2 text-[0.68rem] uppercase tracking-[0.12em] transition-colors ${
                  isActive
                    ? "border-[#b3997a] bg-[#eadfcd] text-[#3f3528]"
                    : "border-border bg-surface-inner-strong text-[#5b5143] hover:bg-surface-hover"
                }`}
              >
                {speedOption.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-[0.68rem] uppercase tracking-[0.14em] text-muted">
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
            setIsPlaying(false);
            setStepIndex(Number(event.target.value));
          }}
          className="alg-scrubber w-full"
          style={scrubberStyle}
        />
      </div>

      {normalizedInputChanged ? (
        <div className="rounded-md border border-border-inner bg-surface-inner p-3 text-sm leading-relaxed text-text-secondary">
          This algorithm requires sorted input, so the visualizer is using a
          sorted copy of your dataset:
          <span className="font-medium"> {normalizedValues.join(", ")}</span>
        </div>
      ) : null}

      <div className="space-y-3">
        <div className="hidden flex-wrap items-center justify-between gap-3 md:flex">
          <div className="space-y-1">
            <p className="text-[0.68rem] uppercase tracking-[0.14em] text-muted">
              chart + counters
            </p>
            <p className="text-sm leading-relaxed text-text-body">
              The visualization and the live counters stay together so each step
              is easier to read.
            </p>
          </div>
          <p className="w-full break-words text-[0.64rem] uppercase tracking-[0.12em] text-muted sm:w-auto sm:text-[0.68rem] sm:tracking-[0.14em] [overflow-wrap:anywhere]">
            current action · {currentStep.actionLabel}
          </p>
        </div>

        <div className="rounded-md border border-border-inner bg-surface-inner px-3 py-2 md:hidden">
          <p className="text-[0.62rem] uppercase tracking-[0.12em] text-muted">
            current action
          </p>
          <p className="mt-1 text-sm leading-relaxed text-text-secondary">
            {currentStep.actionLabel}
          </p>
        </div>

        <div
          className="hidden gap-2 overflow-hidden md:grid"
          style={counterGridStyle}
        >
          {metricEntries.map((metricDefinition) => {
            const currentValue = currentStep.metrics?.[metricDefinition.key];
            const finalValue = finalStep.metrics?.[metricDefinition.key];

            return (
              <div
                className="min-w-0 rounded-md border border-border-inner bg-surface-inner px-2 py-1.5 md:flex md:min-h-[3.75rem] md:flex-col md:justify-between"
                key={metricDefinition.key}
              >
                <p className="break-words text-[0.48rem] leading-tight uppercase tracking-[0.08em] text-muted [overflow-wrap:anywhere] md:text-[0.58rem] md:tracking-[0.1em] xl:text-[0.64rem]">
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
            );
          })}
          <div className="min-w-0 rounded-md border border-border-inner bg-surface-inner px-2 py-1.5 md:flex md:min-h-[3.75rem] md:flex-col md:justify-between">
            <p className="break-words text-[0.48rem] leading-tight uppercase tracking-[0.08em] text-muted [overflow-wrap:anywhere] md:text-[0.58rem] md:tracking-[0.1em] xl:text-[0.64rem]">
              steps
            </p>
            <div className="mt-1 md:mt-0 md:self-end md:text-right">
              <p className="text-[0.85rem] font-semibold leading-tight text-[#3f3528] md:text-[1rem] xl:text-[1.12rem]">
                {stepIndex + 1} / {steps.length}
              </p>
            </div>
          </div>
        </div>

        <div
          className="min-w-0 swift-surface rounded-lg p-4 sm:p-5"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {algorithmDefinition.visualMode === "bars" ? (
            <ArrayBarVisualization step={currentStep} />
          ) : null}
          {algorithmDefinition.visualMode === "cards" ? (
            <ArrayCardVisualization
              step={currentStep}
              targetValue={sharedTargetValue}
            />
          ) : null}
          {algorithmDefinition.visualMode === "graph" &&
          algorithmDefinition.graph ? (
            <GraphVisualization
              graph={algorithmDefinition.graph}
              step={currentStep}
            />
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-1 lg:grid-cols-1">
        <section className="swift-surface rounded-lg p-5 space-y-4">
          <div className="rounded-md border border-border-inner bg-surface-inner p-4 space-y-3">
            <div className="space-y-1.5">
              <h3 className="text-[0.68rem] uppercase tracking-[0.14em] text-muted">
                run summary
              </h3>
              <p className="text-sm leading-relaxed text-text-secondary">
                {summaryMessage}
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {summaryMetricEntries.map((metricEntry) => (
                <div
                  key={metricEntry.key}
                  className="rounded-md border border-[#e3d8c8] bg-surface-strong px-3 py-2"
                >
                  <p className="text-[0.55rem] uppercase tracking-[0.12em] text-muted">
                    {metricEntry.label}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#3f3528]">
                    {formatMetricValue(metricEntry.value as number)}
                  </p>
                </div>
              ))}
              <div className="rounded-md border border-[#e3d8c8] bg-surface-strong px-3 py-2">
                <p className="text-[0.55rem] uppercase tracking-[0.12em] text-muted">
                  steps
                </p>
                <p className="mt-1 text-sm font-semibold text-[#3f3528]">
                  {steps.length}
                </p>
              </div>
            </div>

            {finalPathLabel ? (
              <div className="rounded-md border border-[#e3d8c8] bg-surface-strong px-3 py-3">
                <p className="text-[0.55rem] uppercase tracking-[0.12em] text-muted">
                  final route
                </p>
                <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                  {finalPathLabel}
                </p>
                {typeof finalStep.metrics?.pathCost === "number" ? (
                  <p className="mt-2 text-[0.68rem] uppercase tracking-[0.12em] text-muted">
                    cost {formatMetricValue(finalStep.metrics.pathCost)}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <h3 className="text-[0.68rem] uppercase tracking-[0.14em] text-muted">
              current explanation
            </h3>
            <p className="text-sm leading-relaxed text-text-secondary">
              {currentStep.message}
            </p>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-[0.68rem] uppercase tracking-[0.14em] text-muted">
              simple explanation
            </h3>
            <p className="text-sm leading-relaxed text-text-body">
              {currentStep.simpleExplanation}
            </p>
          </div>

          {quizMode && quiz ? (
            <div className="rounded-lg border border-border-inner bg-surface-inner p-4 space-y-3">
              <div className="space-y-1">
                <p className="text-[0.68rem] uppercase tracking-[0.14em] text-muted">
                  quiz mode
                </p>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {quiz.question}
                </p>
              </div>
              <div className="grid gap-2">
                {quiz.options.map((option) => {
                  const isSelected = selectedQuizAnswer === option;
                  const isCorrect = option === quiz.correctAnswer;

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
                          : "border-border bg-surface-strong text-text-secondary hover:bg-[#f1eadf]"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              {selectedQuizAnswer ? (
                <p className="text-sm leading-relaxed text-text-body">
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
            <h3 className="text-[0.68rem] uppercase tracking-[0.14em] text-muted">
              pseudocode
            </h3>
            <div className="rounded-md border border-border-inner bg-[#f4ece0] p-4 font-mono text-[0.8rem] leading-7 text-[#4b4033]">
              {algorithmDefinition.pseudocode.map((line, lineIndex) => {
                const isActive = lineIndex + 1 === currentStep.pseudocodeLine;

                return (
                  <div
                    key={`${algorithmDefinition.id}-${line}`}
                    className={`flex gap-3 rounded-md px-2 ${isActive ? "bg-[#eadfcd] text-[#3f3528]" : ""}`}
                  >
                    <span className="select-none text-[#9a8873]">
                      {lineIndex + 1}
                    </span>
                    <span>{line}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-md border border-border-inner bg-surface-inner p-4 space-y-3">
            <h3 className="text-[0.68rem] uppercase tracking-[0.14em] text-muted">
              complexity card
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <p className="text-[0.66rem] uppercase tracking-[0.12em] text-muted">
                  best
                </p>
                <p className="text-sm text-text-secondary">
                  {algorithmDefinition.complexity.best}
                </p>
              </div>
              <div>
                <p className="text-[0.66rem] uppercase tracking-[0.12em] text-muted">
                  average
                </p>
                <p className="text-sm text-text-secondary">
                  {algorithmDefinition.complexity.average}
                </p>
              </div>
              <div>
                <p className="text-[0.66rem] uppercase tracking-[0.12em] text-muted">
                  worst
                </p>
                <p className="text-sm text-text-secondary">
                  {algorithmDefinition.complexity.worst}
                </p>
              </div>
              <div>
                <p className="text-[0.66rem] uppercase tracking-[0.12em] text-muted">
                  space
                </p>
                <p className="text-sm text-text-secondary">
                  {algorithmDefinition.complexity.space}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="swift-surface rounded-lg p-5 space-y-4">
        <h3 className="text-[0.68rem] uppercase tracking-[0.14em] text-muted">
          algorithm notes
        </h3>
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="space-y-3">
            <div className="rounded-md border border-border-inner bg-surface-inner p-4">
              <p className="max-w-full truncate text-[0.55rem] uppercase tracking-[0.12em] text-muted sm:text-[0.66rem] sm:tracking-[0.14em]">
                intuition
              </p>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                {algorithmDefinition.notes.intuition}
              </p>
            </div>
            <div className="rounded-md border border-border-inner bg-surface-inner p-4">
              <p className="max-w-full truncate text-[0.55rem] uppercase tracking-[0.12em] text-muted sm:text-[0.66rem] sm:tracking-[0.14em]">
                tradeoffs
              </p>
              <ul className="mt-2 list-disc pl-5 space-y-1 text-sm leading-relaxed text-text-secondary">
                {algorithmDefinition.notes.tradeoffs.map((tradeoff) => (
                  <li key={tradeoff}>{tradeoff}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="space-y-3">
            <div className="rounded-md border border-border-inner bg-surface-inner p-4">
              <p className="max-w-full truncate text-[0.55rem] uppercase tracking-[0.12em] text-muted sm:text-[0.66rem] sm:tracking-[0.14em]">
                when to use it
              </p>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                {algorithmDefinition.notes.whenToUse}
              </p>
            </div>
            <div className="rounded-md border border-border-inner bg-surface-inner p-4">
              <p className="max-w-full truncate text-[0.55rem] uppercase tracking-[0.12em] text-muted sm:text-[0.66rem] sm:tracking-[0.14em]">
                interview tips
              </p>
              <ul className="mt-2 list-disc pl-5 space-y-1 text-sm leading-relaxed text-text-secondary">
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
          <h3 className="text-[0.68rem] uppercase tracking-[0.14em] text-muted">
            what I learned building this
          </h3>
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(17rem, 1fr))" }}>
            <div className="rounded-md border border-border-inner bg-surface-inner p-4">
              <p className="max-w-full truncate text-[0.55rem] uppercase tracking-[0.12em] text-muted sm:text-[0.66rem] sm:tracking-[0.14em]">
                typed definitions
              </p>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                One algorithm schema now drives the catalog, counters,
                pseudocode, notes, and visual modes, which keeps the UI
                consistent as the lab grows.
              </p>
            </div>
            <div className="rounded-md border border-border-inner bg-surface-inner p-4">
              <p className="max-w-full truncate text-[0.55rem] uppercase tracking-[0.12em] text-muted sm:text-[0.66rem] sm:tracking-[0.14em]">
                replay over mutation
              </p>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                Precomputed steps made it much easier to synchronize
                explanations, metrics, quiz prompts, and scrubber playback
                without hidden state drifting out of sync.
              </p>
            </div>
            <div className="rounded-md border border-border-inner bg-surface-inner p-4">
              <p className="max-w-full truncate text-[0.55rem] uppercase tracking-[0.12em] text-muted sm:text-[0.66rem] sm:tracking-[0.14em]">
                portfolio framing
              </p>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                Shareable URL state, compare mode, and responsive layouts
                mattered as much as the algorithm logic because this page needs
                to teach clearly and still feel polished as a product.
              </p>
            </div>
          </div>
        </section>
      ) : null}
    </section>
  );
}
