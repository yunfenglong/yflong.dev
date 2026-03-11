import type { AlgorithmDefinition } from "@/types/algorithm"
import { graphAlgorithms, learningGraph } from "./algorithms/graphs"
import { searchingAlgorithms } from "./algorithms/searching"
import { sortingAlgorithms } from "./algorithms/sorting"

export const algorithmCatalog: AlgorithmDefinition[] = [
  ...sortingAlgorithms,
  ...searchingAlgorithms,
  ...graphAlgorithms,
]

export const algorithmCatalogById = Object.fromEntries(
  algorithmCatalog.map((algorithmDefinition) => [algorithmDefinition.id, algorithmDefinition]),
) as Record<string, AlgorithmDefinition>

export const algorithmCategories = Array.from(
  new Set(algorithmCatalog.map((algorithmDefinition) => algorithmDefinition.category)),
)

export const algorithmDifficulties = Array.from(
  new Set(algorithmCatalog.map((algorithmDefinition) => algorithmDefinition.difficulty)),
)

export const graphTargetOptions = learningGraph.nodes.map((node) => ({
  label: node.label,
  value: node.id,
}))
