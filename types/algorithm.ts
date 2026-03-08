export type AlgorithmCategory = "sorting" | "searching"

export interface AlgorithmStep {
  values: number[]
  message: string
  comparedIndices?: number[]
  activeIndices?: number[]
  sortedIndices?: number[]
  foundIndices?: number[]
  range?: [number, number]
}

export interface AlgorithmDefinition {
  id: string
  name: string
  category: AlgorithmCategory
  description: string
  timeComplexity: string
  spaceComplexity: string
  concepts: string[]
  initialValues: number[]
  targetValue?: number
  pseudocode: string[]
  createSteps: (values: number[], targetValue?: number) => AlgorithmStep[]
}
