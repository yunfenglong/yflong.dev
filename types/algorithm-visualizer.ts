import type { Edge, Node } from "@xyflow/react"
import type { AlgorithmCategory } from "@/types/algorithm"

export type FilterValue = "all" | AlgorithmCategory
export type GroupBy = "none" | "category" | "difficulty"
export type ToolbarOption<T extends string> = { label: string; value: T }

export type PersistedState = {
  activeFilter?: FilterValue
  groupBy?: GroupBy
  selectedAlgorithmId?: string
  secondaryAlgorithmId?: string
  isCompareMode?: boolean
  quizMode?: boolean
  arrayValues?: number[]
  targetValue?: number
  graphTargetNodeId?: string
}

export type AlgorithmQuiz = {
  correctAnswer: string
  options: string[]
  question: string
}

export type AlgorithmGraphNodeTone =
  | "default"
  | "frontier"
  | "visited"
  | "active"
  | "path"
  | "found"

export type AlgorithmGraphEdgeTone = "default" | "active" | "path"

export type AlgorithmGraphNodeData = {
  label: string
  tone: AlgorithmGraphNodeTone
  distanceLabel?: string
}

export type AlgorithmGraphEdgeData = {
  tone: AlgorithmGraphEdgeTone
  weightLabel?: string
}

export type AlgorithmGraphFlowNode = Node<AlgorithmGraphNodeData, "algorithmGraphNode">
export type AlgorithmGraphFlowEdge = Edge<AlgorithmGraphEdgeData, "algorithmGraphEdge">
