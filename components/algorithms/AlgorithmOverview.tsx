"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { algorithmCatalog } from "@/config/algorithms";
import { SegmentedControl } from "./AlgorithmVisualizerControls";
import { filterOptions, groupOptions } from "./AlgorithmVisualizer.constants";
import type { AlgorithmDefinition } from "@/types/algorithm";
import type { FilterValue, GroupBy } from "@/types/algorithm-visualizer";
import {
  formatCategoryLabel,
  formatDifficultyLabel,
} from "@/utils/algorithm-visualizer";

type CuratedPreset = {
  label: string;
  title: string;
  description: string;
  algorithmId: string;
  compareMode?: boolean;
  secondaryAlgorithmId?: string;
  quizMode?: boolean;
};

const curatedPresets: CuratedPreset[] = [
  {
    label: "start here",
    title: "Bubble sort walkthrough",
    description:
      "Best first stop for seeing pseudocode, counters, and step-by-step state changes line up.",
    algorithmId: "bubble-sort",
  },
  {
    label: "side by side",
    title: "Linear vs binary",
    description:
      "Compare scanning against range-halving on the same target and dataset.",
    algorithmId: "linear-search",
    compareMode: true,
    secondaryAlgorithmId: "binary-search",
  },
  {
    label: "graph demo",
    title: "Dijkstra pathfinding",
    description:
      "Jump straight into the weighted graph view to inspect relaxations, costs, and the final route.",
    algorithmId: "dijkstra",
  },
];

function getTradeoffSummary(algorithmDefinition: AlgorithmDefinition) {
  const keywordPattern =
    /slow|requires|not |does not|worse|degrades|queue can|grows|extra memory|worst-case|not helpful/i;

  return (
    algorithmDefinition.notes.tradeoffs.find((tradeoff) =>
      keywordPattern.test(tradeoff),
    ) ??
    algorithmDefinition.notes.tradeoffs[
      algorithmDefinition.notes.tradeoffs.length - 1
    ] ??
    "Explore the full notes for caveats and constraints."
  );
}

function buildAlgorithmHref({
  algorithmId,
  compareMode,
  secondaryAlgorithmId,
  quizMode,
}: CuratedPreset) {
  const query = new URLSearchParams();

  if (compareMode && secondaryAlgorithmId) {
    query.set("compare", "1");
    query.set("secondary", secondaryAlgorithmId);
  }

  if (quizMode) {
    query.set("quiz", "1");
  }

  const queryString = query.toString();
  return queryString
    ? `/alg/${algorithmId}?${queryString}`
    : `/alg/${algorithmId}`;
}

export default function AlgorithmOverview() {
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");
  const [groupBy, setGroupBy] = useState<GroupBy>("category");

  const filteredAlgorithms = useMemo(
    () =>
      activeFilter === "all"
        ? algorithmCatalog
        : algorithmCatalog.filter(
            (algorithmDefinition) =>
              algorithmDefinition.category === activeFilter,
          ),
    [activeFilter],
  );

  const groupedAlgorithms = useMemo(() => {
    if (groupBy === "none") {
      return [
        { key: "all", label: "all algorithms", items: filteredAlgorithms },
      ];
    }

    const groups = new Map<string, AlgorithmDefinition[]>();

    for (const algorithmDefinition of filteredAlgorithms) {
      const groupKey =
        groupBy === "category"
          ? formatCategoryLabel(algorithmDefinition.category)
          : formatDifficultyLabel(algorithmDefinition.difficulty);
      const existingAlgorithms = groups.get(groupKey) ?? [];
      groups.set(groupKey, [...existingAlgorithms, algorithmDefinition]);
    }

    return Array.from(groups.entries()).map(([key, items]) => ({
      key,
      label: key,
      items,
    }));
  }, [filteredAlgorithms, groupBy]);

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="swift-surface rounded-lg p-4 sm:p-5 space-y-4">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <p className="text-[0.68rem] uppercase tracking-[0.14em] text-muted">
              algorithm catalog
            </p>
            <p className="text-sm leading-relaxed text-text-body">
              Choose a lane, open a curated demo, then jump into a dedicated
              visualizer page when you want the chart or canvas.
            </p>
          </div>
          <p className="text-[0.68rem] uppercase tracking-[0.14em] text-muted">
            showing {filteredAlgorithms.length} algorithm
            {filteredAlgorithms.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="hidden space-y-3 md:block">
          <div className="space-y-1">
            <p className="text-[0.68rem] uppercase tracking-[0.14em] text-muted">
              start here
            </p>
            <p className="text-sm leading-relaxed text-text-body">
              These presets are the quickest way to see the strongest demos in
              this section.
            </p>
          </div>

          <div className="grid gap-3 xl:grid-cols-3">
            {curatedPresets.map((preset) => (
              <Link
                key={preset.title}
                href={buildAlgorithmHref(preset)}
                className="rounded-lg border border-[#d8cebf] bg-[#fbf7f0] p-4 text-left transition-all hover:border-[#c7b69b] hover:bg-[#f7f1e6]"
              >
                <div className="space-y-2">
                  <p className="text-[0.62rem] uppercase tracking-[0.14em] text-muted">
                    {preset.label}
                  </p>
                  <h2 className="aman-display text-[1.15rem] leading-tight text-text-primary">
                    {preset.title}
                  </h2>
                  <p className="text-sm leading-relaxed text-text-muted-dark">
                    {preset.description}
                  </p>
                  <p className="text-[0.66rem] uppercase tracking-[0.12em] text-muted">
                    {preset.compareMode
                      ? "opens compare mode"
                      : "opens a focused walkthrough"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.2fr_1.05fr]">
          <SegmentedControl
            label="filter"
            value={activeFilter}
            options={filterOptions}
            onChange={setActiveFilter}
          />
          <SegmentedControl
            label="group"
            value={groupBy}
            options={groupOptions}
            onChange={setGroupBy}
          />
        </div>
      </section>

      <div className="space-y-5 sm:space-y-6">
        {groupedAlgorithms.map((group) => (
          <section
            key={group.key}
            className="swift-surface rounded-lg p-4 sm:p-5 space-y-4"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="aman-display text-[1.2rem] text-text-primary uppercase">
                {groupBy === "none" ? "algorithm list" : group.label}
              </h2>
              <span className="text-[0.68rem] uppercase tracking-[0.14em] text-muted">
                {group.items.length} algorithm
                {group.items.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {group.items.map((algorithmDefinition) => (
                <Link
                  key={algorithmDefinition.id}
                  href={`/alg/${algorithmDefinition.id}`}
                  className="rounded-lg border border-[#d8cebf] bg-[#fbf7f0] p-4 text-left transition-all hover:border-[#c7b69b] hover:bg-[#f7f1e6]"
                >
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[0.62rem] uppercase tracking-[0.14em] text-muted">
                        {formatCategoryLabel(algorithmDefinition.category)}
                      </span>
                      <span className="swift-chip">
                        {formatDifficultyLabel(algorithmDefinition.difficulty)}
                      </span>
                      <span className="swift-chip">
                        {algorithmDefinition.complexity.worst}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="aman-display text-[1.3rem] leading-tight text-text-primary">
                        {algorithmDefinition.name}
                      </h3>
                      <p className="text-sm leading-relaxed text-text-muted-dark">
                        {algorithmDefinition.description}
                      </p>
                    </div>

                    <div className="space-y-2 rounded-md border border-[#e3d8c8] bg-surface-inner p-3">
                      <p className="text-[0.66rem] uppercase tracking-[0.12em] text-muted">
                        best for
                      </p>
                      <p className="text-sm leading-relaxed text-text-secondary">
                        {algorithmDefinition.notes.whenToUse}
                      </p>
                      <p className="text-[0.66rem] uppercase tracking-[0.12em] text-muted">
                        tradeoff
                      </p>
                      <p className="text-sm leading-relaxed text-text-secondary">
                        {getTradeoffSummary(algorithmDefinition)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="swift-surface rounded-lg p-4 sm:p-5 space-y-2">
        <p className="max-w-full truncate text-[0.55rem] uppercase tracking-[0.12em] text-muted sm:text-[0.66rem] sm:tracking-[0.14em]">
          visual modes
        </p>
        <p className="text-sm leading-relaxed text-text-secondary">
          Sorting algorithms use bar charts. Search algorithms use index cards.
          Graph algorithms switch to a node-link canvas on their dedicated
          pages.
        </p>
      </section>
    </div>
  );
}
