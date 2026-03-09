export type AlgorithmCategory = "sorting" | "searching" | "graphs"
export type AlgorithmDifficulty = "beginner" | "intermediate" | "advanced"
export type AlgorithmDatasetKind = "array" | "graph"
export type AlgorithmVisualMode = "bars" | "cards" | "graph"
export type AlgorithmTargetType = "number" | "node"

export interface AlgorithmMetrics {
  comparisons?: number
  swaps?: number
  passes?: number
  writes?: number
  low?: number
  high?: number
  mid?: number
  currentIndex?: number
  sortedCount?: number
  visited?: number
  queueSize?: number
  stackSize?: number
  frontierSize?: number
  relaxations?: number
  pathCost?: number
  heapSize?: number
}

export interface GraphNode {
  id: string
  label: string
  x: number
  y: number
}

export interface GraphEdge {
  id: string
  from: string
  to: string
  weight?: number
}

export interface GraphDefinition {
  nodes: GraphNode[]
  edges: GraphEdge[]
  startNodeId: string
  defaultTargetNodeId: string
  directed?: boolean
}

export interface GraphStepState {
  activeNodeIds?: string[]
  visitedNodeIds?: string[]
  frontierNodeIds?: string[]
  foundNodeIds?: string[]
  pathNodeIds?: string[]
  pathEdgeIds?: string[]
  activeEdgeIds?: string[]
  queue?: string[]
  stack?: string[]
  distances?: Record<string, number>
  currentNodeId?: string
}

export interface AlgorithmStep {
  values?: number[]
  message: string
  simpleExplanation: string
  actionLabel: string
  pseudocodeLine: number
  comparedIndices?: number[]
  activeIndices?: number[]
  sortedIndices?: number[]
  foundIndices?: number[]
  range?: [number, number]
  metrics?: AlgorithmMetrics
  graphState?: GraphStepState
}

export interface AlgorithmComplexity {
  best: string
  average: string
  worst: string
  space: string
}

export interface AlgorithmNotes {
  intuition: string
  tradeoffs: string[]
  interviewTips: string[]
  whenToUse: string
}

export interface AlgorithmExecutionInput {
  values: number[]
  targetValue?: number
  graph?: GraphDefinition
  targetNodeId?: string
}

export interface AlgorithmDefinition {
  id: string
  name: string
  category: AlgorithmCategory
  difficulty: AlgorithmDifficulty
  datasetKind: AlgorithmDatasetKind
  visualMode: AlgorithmVisualMode
  description: string
  concepts: string[]
  pseudocode: string[]
  complexity: AlgorithmComplexity
  notes: AlgorithmNotes
  defaultValues?: number[]
  defaultTargetValue?: number
  targetType?: AlgorithmTargetType
  graph?: GraphDefinition
  requiresSortedInput?: boolean
  createSteps: (input: AlgorithmExecutionInput) => AlgorithmStep[]
}
