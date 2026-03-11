import {
  algorithmCatalog,
  algorithmCatalogById,
  algorithmCategories,
  graphTargetOptions,
} from "@/config/algorithms"
import type {
  AlgorithmCategory,
  AlgorithmDefinition,
  AlgorithmStep,
  GraphDefinition,
} from "@/types/algorithm"
import { categoryActionPools, storageKey } from "@/components/algorithms/AlgorithmVisualizer.constants"
import type { AlgorithmQuiz, FilterValue, GroupBy, PersistedState } from "@/types/algorithm-visualizer"

export function formatCategoryLabel(category: AlgorithmCategory) {
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

export function formatDifficultyLabel(difficulty: AlgorithmDefinition["difficulty"]) {
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

export function arraysEqual(leftValues: number[], rightValues: number[]) {
  if (leftValues.length !== rightValues.length) {
    return false
  }

  return leftValues.every((value, index) => value === rightValues[index])
}

export function parseArrayInput(rawInput: string) {
  return rawInput
    .split(/[\s,]+/)
    .map((token) => Number(token.trim()))
    .filter((value) => Number.isFinite(value))
    .map((value) => Math.max(1, Math.min(99, Math.round(value))))
    .slice(0, 12)
}

export function randomArrayValues(length = 8) {
  return Array.from({ length }, () => Math.floor(Math.random() * 89) + 10)
}

export function normalizeValuesForAlgorithm(algorithmDefinition: AlgorithmDefinition, values: number[]) {
  if (!algorithmDefinition.requiresSortedInput) {
    return [...values]
  }

  return [...values].sort((leftValue, rightValue) => leftValue - rightValue)
}

export function getDefaultArrayValues(algorithmDefinition: AlgorithmDefinition | undefined) {
  if (algorithmDefinition?.defaultValues?.length) {
    return [...algorithmDefinition.defaultValues]
  }

  return [
    ...(algorithmCatalog.find((catalogAlgorithm) => catalogAlgorithm.defaultValues?.length)?.defaultValues ?? [
      8,
      3,
      5,
      1,
      9,
      6,
      2,
      7,
    ]),
  ]
}

export function getDefaultTargetValue(algorithmDefinition: AlgorithmDefinition | undefined) {
  if (typeof algorithmDefinition?.defaultTargetValue === "number") {
    return algorithmDefinition.defaultTargetValue
  }

  return 23
}

export function getCompareCandidates(primaryAlgorithm: AlgorithmDefinition) {
  return algorithmCatalog.filter(
    (algorithmDefinition) =>
      algorithmDefinition.id !== primaryAlgorithm.id &&
      algorithmDefinition.datasetKind === primaryAlgorithm.datasetKind &&
      algorithmDefinition.category === primaryAlgorithm.category &&
      algorithmDefinition.targetType === primaryAlgorithm.targetType,
  )
}

export function formatMetricValue(value: number | undefined) {
  if (typeof value !== "number") {
    return "—"
  }

  if (!Number.isFinite(value)) {
    return "∞"
  }

  return String(value)
}

export function getNextQuiz(
  algorithmDefinition: AlgorithmDefinition,
  steps: AlgorithmStep[],
  stepIndex: number,
): AlgorithmQuiz | null {
  const nextStep = steps[stepIndex + 1]

  if (!nextStep) {
    return null
  }

  const distractorPool = Array.from(
    new Set([
      ...categoryActionPools[algorithmDefinition.category],
      ...steps.map((step) => step.actionLabel),
    ]),
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

export function getNodeById(graph: GraphDefinition, nodeId: string) {
  return graph.nodes.find((node) => node.id === nodeId)
}

export function getPrimaryDefaultId() {
  return algorithmCatalog[0]?.id ?? ""
}

export function readPersistedState(): PersistedState | null {
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

export function isValidFilterValue(value: string | null | undefined): value is FilterValue {
  return value === "all" || algorithmCategories.includes(value as AlgorithmCategory)
}

export function isValidGroupValue(value: string | null | undefined): value is GroupBy {
  return value === "none" || value === "category" || value === "difficulty"
}

export function isValidAlgorithmId(value: string | null | undefined) {
  return Boolean(value && algorithmCatalogById[value])
}

export function isValidGraphTarget(value: string | null | undefined) {
  return Boolean(value && graphTargetOptions.some((option) => option.value === value))
}
